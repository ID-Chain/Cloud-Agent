# Setup

# IdentityChain Commons

This repository holds commonly used components, configurations, and tools for the IdentityChain project.

# Guidelines
Add new stuff by either

- creating a directory for it or
- create a new branch normally
- create a new branch with no ancestors from tag empty:
```
git checkout --orphan deployment/aws empty
```

Update the readme, add your changes, submodules, git subtrees, commit, and push the new branch to origin as usual.

# Building, starting and stopping services 

## Building IDC_CA service

Building of the services requires all environment variables used in containers and denoted in composition file to be set in one central .env file, see *Environment variables used in API project* section. Note that building services with environment variables not set may look succeeded, however applications in the containers will likely fail.

To build services use the command:

`./build.sh`

 
## Staring services
 
To start services using default docker-compose.yaml:

`./up.sh`

To start services using another compose script, e.g. *special.yaml*

`./up.sh special`


## Deployment of the Cloud Agent/Agency* API

The deployment of the cloud agent/agency is described in the following.

## Prerequisites

For a brief overview on which parameters are required for a working deployment, check the example.env in the repository.

### Firebase Cloud Messaging
The implementation of the IDChain Cloud Agent implements Firebase Cloud Messaging (FCM) for communication with mobile applications. A prior registration of a project at http://console.firebase.google.com is required to use FCM. Set the following env-variables accordingly. The file we currently used was uploaded to the servers. Current name: 'eit-idchain-app-firebase-adminsdk.json'. It was generated with Bersant Google account and used for the time being.

`IDC_CA_FIREBASE_ADMIN_PATH='/path/to/xxx-adminsdk.json'`

`IDC_CA_FIREBASE_PROJECT_URL='https://xxx.firebaseio.com'`

### LevelDB
The Cloud Agent uses LevelDB for storing data and keeping track of the connections between unique URLs provided to App instances and FCM Tokens. Make sure the application has write access to the path set as described below.

`IDC_CA_DB_PATH='./data'`

### Hyperledger Indy Pool Access

The Cloud Agent requires access to a Hyperledger Indy ledger pool in order to verify DIDs and Endpoints. For this connection a name and the pool transactions genesis of the pool is required.

`IDC_POOL_IP=172.16.0.100`

`IDC_POOL_NAME=poolApi`

`IDC_CA_GENESIS_TXN=pool_transactions_genesis.docker-compose`

## Deployment Parameters
The application runs on the host and port defined in the environment variables.

`IDC_CA_APP_HOST=127.0.1.1`

`IDC_CA_APP_PORT=8080`

In addition for providing unique URLs to mobile apps, the application requires additional settings for the domain and port where the Cloud Agent is actively run at.

`IDC_CA_DOMAIN_HOST=127.0.1.1`

`IDC_CA_DOMAIN_PORT=8080`

Finally, the Cloud Agent implements a Hyperledger Indy Wallet which is used for storing own and foreign DID information, encrypting and decrypting outgoing and incoming messages. Therefore the following env-variables need to be set.

`IDC_CA_WALLET_NAME='example_ca_wallet_name'`

`SECRET='your-secret'`

`CA_DID='Cloud Agent DID for initial onboarding'`

## Deploy the App

It is recommended to deploy the Cloud Agent API behind an Nginx webserver and let Nginx act as a proxy for incoming queries to the API. Also, in order to restart and reboot easily and accessing monitoring of the API we recommend the deployment with pm2.

### PM2

Here are some helpful commands with pm2.

#### Generating Server-specific Startup Scripts

Generating server-specific startup scripts for reboot ready startup. This command will check the underlying server environment and will propose the fitting script to be executed.

`pm2 startup`

`pm2 startup ubuntu`

#### Start/Restart an application with pm2

`pm2 start app.js -n your_app_name`

`pm2 restart your_app_name`

#### List all applications

`pm2 list`

#### Monitor all applications

`pm2 monit`

#### Show application-specific information

`pm2 show your_app_name`

#### Show application-specific logs

`pm2 logs your_app_name`

## Docker

Dockerfiles added

Deployment with docker-compose thru IDChain commons, uses local Dockerfile

In IDChain commons there is a overall en file for settings, also including all other IDChain components

Note: *Cloud Agent/Agency are currently terms used interchangeably. There seems no clear and valid written description on roles and components in Hyperledger Indy yet (as of 09/03/2018).

    How is the CA setup and configured
        Working together with ledger
        How does the ledger need to be configured
    Setup of IDC App
        IDC Test App integration
    Test - how to test a certain CA setup
