# ai-basketball-analytics

## Getting Started

This service is a fully functional microservice which receives HTTP requests with a name and timestamp, prepends "Prof. " to the name and then returns it to the client as well as writes the result to Kafka. It is using Protobuf format for messages sent through Kafka.

It uses a sample Protobuf file under ./proto/. To use cloud-core-proto instead, follow these two steps:

1. Run to add submodule: `git rm proto/sample.proto && git submodule add https://github.com/OptusYesLab/cloud-core-proto.git proto`
2. Update Jenkinsfile's sections of "Uncomment if using submodules" and "Comment out if using submodules"

Prometheus metrics have been prefixed with "ab", this is an abbreviation of "ai-basketball-analytics". This can be updated in src/utils/Metrics.ts if required.

To run the service against an environment, some kafka configuration must be defined. This configuration is saved in `config/` under `default.js`, `dev.js` or `test.js`. `default.js` will always be used and `dev.js` or `test.js` will overlay the default configuration based on the environment variable `NODE_ENV` being set to either "dev" or "test". 

An interface is also setup in `src/interfaces/IConfig.ts` where any configuration used by the application must be defined. This prevents using `any` within the application ultimately making it more clear what can be used.

This is the required configuration:

```json
{
  "kafka": {
    "general": {
      "clientId": "ai-basketball-analytics",
      "brokers": ["<kafka broker>:9092"],
      "producerTopic": "<namespace>-<tower>-ai-basketball-analytics.proto" // <1>
    }
  }
}
```

<1> This tends to be named after the producing service

#### HTTP API
|URI        |HTTP Method |JSON Body                              |Required headers    |Description|
|-----------|------------|---------------------------------------|-------------------|------------|
|/v1/convert|POST        |{ "name": string, "timestamp": number }|\<Add Headers here>|Prepends the 'name' field with "Prof ." and returns it to the client as well as writes it to Kafka


## Development

The only external dependency is Kafka. It is not required for normal development, but to run in "Dev mode" or running System Test will require to have Kafka running.

To startup kafka, you can download the docker-compose.yml and run with the following command:

```bash
wget https://raw.githubusercontent.com/confluentinc/cp-docker-images/5.1.0-post/examples/kafka-single-node/docker-compose.yml && \
grep -q "KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0" docker-compose.yml || echo -e "\n      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0" >> docker-compose.yml && \
docker-compose up -V --force-recreate
```

### Local development

Install required packages: `npm install`

Run Unit and Integration tests:

```bash
npm test
```

Build and run locally:

```bash
# Start in development mode:
npm run start:dev
```

## Build & Deploy

To build: `npm run build`

To run: `npm start`

Test Docker build locally:

```bash
npm install && npm run build
docker build -t ai-basketball-analytics .
```

## Running

```bash
npm start
```

## Conventions
### Directory structure

```bash
 /
 |- config/              # Config file per environment. For running in containerised environment, set NODE_ENV
 |- proto/               # Location for Protobuf files
 |- src/api/middlewares/ # Contains any custom middleware functions to use with Express
 |- src/api/routes/      # Contains all routes for the application
 |- src/api/schemas/     # Contains all schemas that are used to validate requests to any routes
 |- src/components/      # Contains components of the application necessary for the application to function
 |- src/services/        # Contains the business logic
 |- src/interfaces/
 |- src/utils/           # Miscellaneous helper functions
 |- test/                # For integration and system tests
 |- src/App.ts           # Boilerplate setup to start/stop the components of the application
 |- src/Server.ts        # Code to run application as a stand-alone service
 |- src/index.ts         # Entrypoint to startup the application
```

### Filenames
* Classes - <PascalCase>.ts
* Interfaces - I<PascalCase>.ts (Do prefix with I)
* Unit Tests - <PascalCase>.unit.test.ts
* Integration Tests - <PascalCase>.int.test.ts, place in test/integration/
* System Tests - <PascalCase>.st.test.ts, place in test/st/
