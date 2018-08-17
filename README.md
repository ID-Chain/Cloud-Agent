[![stability - experimental](https://img.shields.io/badge/stability-experimental-orange.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)
![Swagger Validator](https://img.shields.io/swagger/valid/2.0/https/raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json.svg)

## IDChain Cloud Agent

Cloud Agent Implementation used by Mobile Edge Agents to communicate to other Agents. Uses Google Firebase Messages with Hyperledger Indy for communication.

### Prerequisites 

* Firebase service registration and setup of [Firebase].
* Access to File System for LevelDB

### Config

Check `example.env` for an example configuration of the required `.env` file for configuration of indy-pool, host and port of API
and DB. If required add own `pool_transaction_genesis` file and change configuration here.

### RUN 
		npm install 
		npm start
		
### Swagger 
Documentation of Cloud Agent API calls can be found under

	http://APP_HOST:APP_PORT/ca/api/docs



[Firebase]: http://firebase.google.com