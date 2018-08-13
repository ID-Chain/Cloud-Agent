[![stability - experimental](https://img.shields.io/badge/stability-experimental-orange.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)
![Swagger Validator](https://img.shields.io/swagger/valid/2.0/https/raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json.svg)

## IDChain Agency

Microservice for communaction between Cloud Agents and Mobile Edge Agents through Google Firebase with Hyperledger Indy

### Prerequisites 

* Firebase service registration and setup of [Firebase].
* Access to File System for LevelDB

### Config

Check `.env` file for configuration of indy-pool, host and port of API
and DB. If required add own `pool_transaction_genesis` file and change
configuration here.

### RUN 
		npm install 
		npm start
		
### Swagger 
Documentation of Agency API calls can be found under

	http://APP_HOST:APP_PORT/agency/api/docs



[Firebase]: http://firebase.google.com