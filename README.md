<img src="https://id-chain.github.io/square-logo300x300.png" align="left" height="140px" style="margin-right: 30px;" />

# IdentityChain Cloud Agent

Cloud Agent Implementation used by Mobile Edge Agents to communicate to other Agents. Uses Google Firebase Messages with Hyperledger Indy for communication.

### Prerequisites 

* Firebase service registration and setup of [Firebase].
* Access to File System for LevelDB

### Config

Check `example.env` for an example configuration of the required `.env` file for configuration of indy-pool, host and port of API
and DB. If required add own `pool_transaction_genesis` file and change configuration here.

## Run

```bash
npm install 
npm start
```
		
### Swagger 
Documentation of Cloud Agent API calls can be found under
```http request
 http://IDC_CA_APP_HOST:IDC_CA_APP_PORT/ca/api/docs
```

[Firebase]: http://firebase.google.com