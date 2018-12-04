# Introduction
Within Hyperledger Indy/Sovrin there is the notion of an agent or an agency respectively. The different terms are described below. In our current implementation and the IdentityChain project we use the term cloud agent as an intermediary between the ledger and the mobile app. The cloud agent fulfills the purpose of forwarding messages if the app is not online or reachable.

# Motivation
Within the IdentityChain (IDC) project the IndySDK is used on the IdentityChain API layer and the Android app layer. The API abstracts the IndySDK functionality to ease the use for developers. The Android app which is written in Java is using the IndySDK Java wrapper for exchanging values and methods with the ledger.
The motivation for the introduction of a cloud agent within IdentityChain was the fact that credentials will be send, updated and revoked from the issuer's interface, in our case a web application using the IdentityChain-API.
In a scenario where the app is not online and/or connected with the ledger, the IdentityChain Cloud Agent (IDC-CA) is handling temporal storing and forwarding of messages, i.e., verifiable credentials, using the Google Firebase services and APIs. The IDC-CA is also used to initiate a setup of values for the IDC Mobile App. The IDC-CA can be seen as a unique endpoint for the mobile app. In future there will be additional functionalities and use cases extending the IDC-CA. This is also inline with the notion of agents within Hyperledger Indy itself, e.g., surrogate functions, such as automated replies to certain proof requests.

# The different notions of Agents
In the following sub-sections the notion of the IDC agents is described. It may differ from the Hyperledger Indy/Sovrin meaning, which ca be found under:

https://github.com/hyperledger/indy-agent/tree/master/docs

## Edge Agent

An Edge Agent is positioned close to the user interface. If the hardware and network of the edge device is capable enough, i.e., a PC or laptop, the edge agent can talk to the ledger directly and is also hosting a wallet which includes all keys and credentials. This can also be a more potent machine, i.e., a server in an institution, such as a bank, which provides functionalities for user interfaces, such as web-based once. This edge agent is then called institutional edge agent. Otherwise, there are mobile edge agents for devices which are not always online and need additional functionalities to connect to other agents. In our case this is a mobile app, which is the interface for the identity holder and is connected to a cloud agent.

### Mobile Edge Agent

As described above, a mobile edge agent is a user interface device, such as a smartphone which is not always online and is connected to a cloud agent which serves it as a message broker, etc. In our case the IDChain mobile Android app is an mobile edge agent.

## Institutional Edge Agent

An institutional edge agent is capable of communicating with other edge and cloud agents and serves as the interface for the employees of the institution. In our case the institutional edge agent is the IndySDK together with the REST-API serving the front-end Admin PortalUI.

## Cloud Agent

A cloud agent is serving devices which have less capabilities such as smartphone apps. It redirects messages without knowing their contents to the specific edge agent. In our case we use key-value stores to be able to forward the incoming messages to the correct mobile using Firebase service from Google. The cloud agent can either run at an agency (service), see below or on the controlled hardware of the identity holder, such as a home NAS, Router, or similar.n It is to be noted that a cloud agent serving one app should have different endpoints for the different pairwise connections as it ensures more privacy for the identity holder. As of now, we neglect this in the IDChain project implementation, as the current version of the Indy ledger does not support complex endpoints to be stored on the ledger, at the moment only IP and Port can be stored.
Agency

An agency in our understanding is the hoster of cloud agents for identity holders, this can be a telephone operator, an IT service provider, bank or another trusted entity.

## Hub (text from github indy-agent)

Additionally there is the notion of a hub in Indy/Sovrin

A Hub is much like a Cloud Agent, but rather than focusing only on messaging (transport) as defined above for a Cloud Agent, the Hub also stores and shares data (potentially including Verifiable Credentials), on behalf of its owner. All of the data held by the Hub is en/decrypted by the Edge Agent, so it is the data that moves between the Edge and Hub, and not keys. The Hub storage can (kind of) be thought of as a remote version of a Wallet without the keys, but is intended to hold more than just the Verifiable Credentials of an Edge Agent wallet. The idea is that the user can push lots of, for example, app-related data to the Hub, and a Service would be granted permission by the Owner to directly access the data without having to go to the Edge Agent. For example, a Hub-centric music service would store the owner’s config information and playlists on the Hub, and the Service would fetch the data from the Hub on use instead of storing it on it’s own servers.