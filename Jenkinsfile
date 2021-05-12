def appName = 'ai-basketball-analytics'
def shortCommit = ''
def branch = ''

def getProject() {
  openshift.withCluster() {
    def projectName = openshift.project();
    echo "Building in namespace: ${projectName}"
    return projectName
  }
}

pipeline {
  agent any
  options {
    timeout(time: 20, unit: 'MINUTES')
  }
  environment {
    NAMESPACE = getProject()
  }
  stages {
    stage("Build Package") {
      agent {
        kubernetes {
          cloud 'openshift'
          label "${appName}-build"
          defaultContainer 'jnlp'
          yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: build
    image: docker-registry.default.svc:5000/ground/nodejs-12-build-stretch:latest
    tty: true
    command:
    - cat
    env:
      - name: HOME
        value: /home/jenkins
"""
        }
      }
      steps {
        // Comment out if using submodules
        script {
          def command = $/printf ${env.GIT_COMMIT} | cut -c -7 | tr -d "\n"/$
          shortCommit = sh(returnStdout: true, script: command )

          command = $/printf ${env.GIT_BRANCH} | sed 's/\//\_/' | tr -d "\n"/$
          branch = sh(returnStdout: true, script: command )
        }
        container('build') {
/* Uncomment if using submodules
          checkout([
            $class: 'GitSCM',
            branches: scm.branches,
            doGenerateSubmoduleConfigurations: false,
            extensions: scm.extensions + [[$class: 'SubmoduleOption', disableSubmodules: false, recursiveSubmodules: true, reference: '', trackingSubmodules: false, parentCredentials: true]],
            submoduleCfg: [],
            userRemoteConfigs: scm.userRemoteConfigs])
          script {
            shortCommit = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()
            def command = $/printf ${env.GIT_BRANCH} | sed 's/\//\_/' | tr -d "\n"/$
            branch = sh(returnStdout: true, script: command )
          }
*/
          sh "npm audit || echo 'Audit failed, will continue run'"
          sh "npm ci"
          sh "npm run lint"
          sh "npm run build"
          sh "npm test"
          stash name: "unitTestResults", includes: "allure-results/"
          step([
            $class: 'CloverPublisher',
            cloverReportDir: 'build/coverage',
            cloverReportFileName: 'clover.xml',
            healthyTarget: [methodCoverage: 95, conditionalCoverage: 95, statementCoverage: 100], // optional, default is: method=70, conditional=80, statement=80
            unhealthyTarget: [methodCoverage: 90, conditionalCoverage: 90, statementCoverage: 90], // optional, default is none
            failingTarget: [methodCoverage: 0, conditionalCoverage: 0, statementCoverage: 0]     // optional, default is none
          ])
          sh "sed -i 's/^ENV GIT_COMMIT local\$/ENV GIT_COMMIT ${shortCommit}/' Dockerfile"
          stash name: "source", excludes: "${appName}.tar.gz"
          sh "npm prune --production"
          sh "npm run package"
          stash name: "pkg", includes: "${appName}.tar.gz"
        }
      }
    }
    stage('System Testing') {
      agent {
        kubernetes {
          cloud 'openshift'
          label "${appName}-system-testing"
          defaultContainer 'jnlp'
          yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: nodejs
    image: docker-registry.default.svc:5000/ground/nodejs-12-build-stretch:latest
    tty: true
    command:
      - cat
  - name: zookeeper
    image: confluentinc/cp-zookeeper:latest
    ports:
    - containerPort: 2181
    readinessProbe:
      tcpSocket:
        port: 2181
      initialDelaySeconds: 10
      periodSeconds: 10
    env:
    - name: ZOOKEEPER_CLIENT_PORT
      value: 2181
    - name: ZOOKEEPER_TICK_TIME
      value: 2000
  - name: kafka
    image: confluentinc/cp-kafka:latest
    ports:
    - containerPort: 9092
    readinessProbe:
      tcpSocket:
        port: 9092
      initialDelaySeconds: 10
      periodSeconds: 10
    env:
    - name: KAFKA_BROKER_ID
      value: 1
    - name: KAFKA_ZOOKEEPER_CONNECT
      value: localhost:2181
    - name: KAFKA_ZOOKEEPER_CONNECT
      value: localhost:2181
    - name: KAFKA_ADVERTISED_LISTENERS
      value: PLAINTEXT://localhost:29092,PLAINTEXT_HOST://localhost:9092
    - name: KAFKA_LISTENER_SECURITY_PROTOCOL_MAP
      value: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
    - name: KAFKA_INTER_BROKER_LISTENER_NAME
      value: PLAINTEXT
    - name: KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR
      value: 1
    - name: KAFKA_AUTO_CREATE_TOPICS_ENABLE
      value: true
    - name: KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS
      value: 0
    - name: KAFKA_NUM_PARTITIONS
      value: 9
"""
        }
      }
      steps {
        container('nodejs') {
          unstash "source"
          sh 'npm run test:st'
          stash name: "stTestResults", includes: "allure-results/"
        }
      }
    }
    stage('Fortify Scan') {
      agent {
        label 'nodejs-8-fortify'
      }
      steps {
        unstash "source"
        sh """
          sourceanalyzer -b ${appName} -clean
          sourceanalyzer -b ${appName} dist
          mkdir -p ./build/report
          sourceanalyzer -b ${appName} -scan -f 'build/${appName}-${shortCommit}.fpr'
          BIRTReportGenerator -template 'Developer Workbook' -source 'build/${appName}-${shortCommit}.fpr' -output build/report/fortify-${appName}-git-${shortCommit}.pdf -format PDF -showSuppressed -UseFortifyPriorityOrder
        """
        archiveArtifacts artifacts: 'build/report/*.pdf', fingerprint: true
      }
    }
    stage('Upload Test Results') {
      steps {
        dir("allure-results") {
          deleteDir()
        }
        unstash "unitTestResults"
        unstash "stTestResults"
        script {
          if (env.BRANCH_NAME == "master") {
            withAWS(region:'ap-southeast-2',credentials: env.NAMESPACE + '-allure-reports-s3') {
              // Upload test reports to S3
              s3Upload(bucket:"c4-allure-reports", file:'allure-results', path: "${appName}/${BUILD_NUMBER}");
            }
          } else {
            echo "Skipping upload to s3 as ${env.BRANCH_NAME} is not master"
          }
        }
        allure results: [[path: 'allure-results']]
      }
    }
    stage('Build App Image') {
      steps {
        script {
          openshift.withCluster() {
            unstash "pkg"
            sh "sed -i 's/^ENV GIT_COMMIT local\$/ENV GIT_COMMIT ${shortCommit}/' Dockerfile"
            def buildSelector = openshift.selector("bc", appName).startBuild("--from-archive=${appName}.tar.gz")
            buildSelector.logs("-f")
            // fail build step if build did not finish succesfully
            if (buildSelector.object().status.phase != "Complete") {
              error("Build Failed: ${buildSelector.object().status.message}")
            }
            openshift.tag("${appName}:latest", "${appName}:git-${shortCommit}")
            openshift.tag("${appName}:latest", "${appName}:${branch}")
          }
        }
      }
    }
    stage('Deploy App') {
      steps {
        script {
          openshift.withCluster() {
            openshift.withProject() {
              def nodedc = openshift.selector("dc", appName)
              def rolloutManager = nodedc.rollout()
              rolloutManager.latest()
              rolloutManager.status("-w")
            }
          }
        }
      }
    }
  }
}
