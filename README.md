# ai-basketball-analytics

## Getting Started

TODO: Add in description here


To run the service against an environment, some kafka configuration must be defined. This configuration is saved in `config/` under `default.js`, `dev.js` or `test.js`. `default.js` will always be used and `dev.js` or `test.js` will overlay the default configuration based on the environment variable `NODE_ENV` being set to either "dev" or "test". 

An interface is also setup in `src/interfaces/IConfig.ts` where any configuration used by the application must be defined. This prevents using `any` within the application ultimately making it more clear what can be used.


<1> This tends to be named after the producing service

#### HTTP API
|URI        |HTTP Method |JSON Body                              |Required headers    |Description|
|-----------|------------|---------------------------------------|-------------------|------------|
|/v1/convert|POST        |{ "name": string, "timestamp": number }|\<Add Headers here>|Prepends the 'name' field with "Prof ." and returns it to the client as well as writes it to Kafka


## Development

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
