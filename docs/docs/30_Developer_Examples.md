# API
    What does the CA API calls do
    How can a developer use the API

## REST-API Structure, Routes, Methods

### messages

#### GET /message/{id}
Retrieve a message

id* A unique string value identifying this message. This request is usually sent to clients through FCM.

#### POST /messages
Send a arbitrary message to known client using FCM. Firebase token should be known to sender

### services

#### POST /services
Send a service request

### indy-inbox

#### POST /indy/{id}
Send a message to a mobile client using the unique URL endpoint provided by mobile edge agent.

id* A unique id describing the endpoint usually provided by the mobile edge agent to this cloud agent.

## Models

### services_post
{
endpoint_did*	string
verkey*	string
endpoint*	string
Contains Firebase Token to be created or updated at Cloud Agent side
}

### services_response
{
endpoint_did	string
The endpoint did of this cloud agent
endpoint	string
The endpoint url provided for this service request
pool_config	{...}
}

### messages_post
{
firebase_token*	string
message*	 string
}

### indy_inbox_post
{
message	string
Anoncrypted Message from other Edge Agents to be forwarded to mobile client
}

# Developer
    What does a dev need to know about the CA
    How can the functionality be extended
# Example
    Example Setup