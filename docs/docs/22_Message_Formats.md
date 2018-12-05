# Message Formats
In Indy/Sovrin message flow and message structures/formats are vital for the different roles and software components. The following gives you an overview of the encryption details and the message formats in detail. There are JSON-based and used in different contexts.

## Encryption
Messages exchanged between the CA and the mobile app and a foreign agents are not only secured via possible https connections but also encrypted in two different ways:

	- anoncryped
	- authcrypted
	
The explanation below is focusing on this difference and motives why it is used.

### anoncrypted
The anonymous-encryption schema is designed for the sending of messages to a recipient which has been given its public key. Only the recipient can decrypt these messages, using its private key. A anoncrypted message is encrypted for the receiver by the sender. The receiver does not know the sender and therefore cannot authenticate her/him/it. The sender send an anonymous message, e.g., at the beginning of a new onboarding process. While the receiver can verify the integrity of the message, it cannot verify the identity of the sender.

### authcrypted
Authenticated encryption (authcrypt) is designed for sending of a confidential message specifically for the Recipient.
The sender can compute a shared secret key using the recipient's public key (verkey) and his secret (signing) key. The recipient can compute exactly the same shared secret key using the sender's public key (verkey) and his secret (signing) key. That shared secret key can be used to verify that the encrypted message was not tampered with, before eventually decrypting it.
A authcrypted message is encrypted for the receiver by the sender. The receiver knows the sender from a previous, e.g., onboarding process and therefore can at this point authenticate her/him/it. The receiver can verify the integrity of the message and the identity of the sender.

# Agent-to-Agent Communication

Messages sent between agents have the following format:
```json
{
  message: <message>
}
```
With `<message>` being one of the message formats described below, mostly as an anoncrypted string (+ authcrypted inner message, if applicable).

# Message Formats

Heavily influenced by: https://github.com/hyperledger/indy-agent/tree/master/docs

Outer messages are always anon-crypted and base64-encoded for the endpointDid (except for connection offer). Inner messages are always auth-crypted and base64-encoded after pairwise is established (from connection acknowledgement onwards).

NOTE: Message types have been changed on indy-agent side, we are still using the initial ones.

1. [Connection Offer](#connection-offer)
2. [Connection Request](#connection-request)
3. [Connection Response](#connection-response)
4. [Connection Acknowledgement](#connection-acknowledgement)
5. [Credential Offer](#credential-offer)
6. [Credential Request](#credential-request)
7. [Credential](#credential)
8. [Proof Request](#proof-request)
9. [Proof](#proof)

## Connection Offer

- renamed offer_nonce to nonce (as it is also implemented in indy-agent, docs differ here)
- added `message.data` field
- message is not encrypted

```javascript
{
	// connection offer nonce
	// necessary when implementing an agency as an id to route to indended agent/wallet
	id: <offer_nonce>,
	type: "urn:sovrin:agent:message_type:sovrin.org/connection_offer",
	message: {
		// Endpoint DID also found in ledger. Together with attached endpoint
		did: <did>,
		// (optional) Required if Endpoint DID not stored on Ledger
		verkey: <verkey>,
		// (optional) Required if Endpoint DID not stored on Ledger or has no diddoc
		endpoint: <endpoint>,
		// connection offer nonce
		nonce: <offer_nonce>,
		// additional field: may contain additional related data such as description, logo, ...
		data: {}
	}
}
```

## Connection Request

- added verkey for cases where the did is not on the ledger (e.g. onboarding or pairwise connection without writing the did on the ledger),
  similar to how there is already a verkey in connection response
- rename `endpoint_did` to `endpointDid` in line with indy-agent implementation
- outer message/payload is anoncrypted for recipient endpoint did
- inner message is not encrypted

```javascript
{
	// if there was a previous offer, then this is the offer nonce, else request nonce
	id: <offer_nonce / request_nonce>,
	type: "urn:sovrin:agent:message_type:sovrin.org/connection_request",
	// inner message is not encrypted
	message: {
		did: <myNewDid>,
		// additional field: (optional) required if did not stored on Ledger
		verkey: <myVerkey>,
		// (optional) required if endpoint DID is not stored on the Ledger or has no diddoc
		endpointDid: <endpointDid>,
		// (optional) required if endpoint DID is not stored on the Ledger or does not contain an endpoint attribute in the did doc
		endpoint: <endpoint>,
		nonce: <request_nonce>
	}
}
```

## Connection Response

- rename `request_nonce` to just `nonce` in message for consistency (as it is also done in indy-agent implementation)
- add `aud` field (as in indy-agent implementation)
- outer message/payload is anoncrypted for recipient endpoint did
- inner message now additionally anoncrypted for recipient pairwise did

```javascript
{
	id: <request_nonce>,
	// additional field: recipient pairwise did
	aud: <theirDid>,
	type: "urn:sovrin:agent:message_type:sovrin.org/connection_response",
	// inner message is anoncrypted and base64 encoded
	message: {
		// my pairwise did and verkey
		did: <myDid>,
		verkey: <myVerkey>,
		nonce: <requestNonce>
	}
}
```

## Connection Acknowledgement

- outer message/payload is anoncrypted for recipient endpoint did
- inner message is now authcrypted using both pairwise dids

```javascript
connection_acknowledgement: {
	// pairwise did of sender
	id: <myDid>,
	type: "urn:sovrin:agent:message_type:sovrin.org/connection_acknowledge",
	// inner message is authcrypted and base64 encoded
	message: "SUCCESS"
}
```

## Credential Offer

- As of 2018-10-11, this message is not defined by indy-agent
- inner message is authcrypted

```javascript
{ // anoncrypted
	id: <offerNonce>,
	// pairwise did of the sender
	origin: <myDid>,
	type: "urn:sovrin:agent:message_type:sovrin.org/credential_offer",
	message: { // authcrypted
		"schema_id": string,
		"cred_def_id": string,
		// Fields below can depend on Cred Def type
		"nonce": <offerNonce>,
		"key_correctness_proof" : <key_correctness_proof>
	} // authcrypted
} // anoncrypted
```

## Credential Request

- As of 2018-10-11, this message is not defined by indy-agent
- inner message is authcrypted

```javascript
{ // anoncrypted
	id: <offerNonce>,
	// pairwise did of sender
	origin: <myDid>,
	type: "urn:sovrin:agent:message_type:sovrin.org/credential_request",
	message: { // authcrypted
		"prover_did" : string,
		"cred_def_id" : string,
		// Fields below can depend on Cred Def type
		"blinded_ms" : <blinded_master_secret>,
		"blinded_ms_correctness_proof" : <blinded_ms_correctness_proof>,
		"nonce": <request_nonce>
	} // authcrypted
} // anoncrypted
```

## Credential

- As of 2018-10-11, this message is not defined by indy-agent
- inner message is authcrypted

```javascript
{ // anoncrypted
	id: <request_nonce>,
	// pairwise did of the sender
	origin: <myDid>,
	type: "urn:sovrin:agent:message_type:sovrin.org/credential",
	message: { // authcrypted
		"schema_id": string,
		"cred_def_id": string,
		"rev_reg_def_id", Optional<string>,
		"values": <see credValues above>,
		// Fields below can depend on Cred Def type
		"signature": <signature>,
		"signature_correctness_proof": <signature_correctness_proof>
	} // authcrypted
} // anoncrypted
```

## Proof Request

- As of 2018-10-11, this message is not defined by indy-agent
- inner message is authcrypted
- 2018-11-01: nonce MUST be numerical

```javascript
{ // anoncrypted
	"id": "<requestNonce>",
	// pairwise did of sender
	"origin": "<myDid>",
	"type": "urn:sovrin:agent:message_type:sovrin.org/proof_request",
	"message": { // authcrypted
		// proof request name
		"name": "<name>",
		// proof request version
		"version": "<version>",
		// proof request nonce
		"nonce": "<requestNonce>"
		"requested_attributes": {
			"attr1_referent": {
				// attribute name, e.g. 'firstname'
				"name": "<attr_name>",
				// restrictions on where the attribute comes from
				// no restrictions mean it may be self-attested
				"restrictions": [{ "cred_def_id": "<cred_def_id>" }]
			}
			"attr2_referent": {
				// self-attested attribtue
				"name": "<attr_name>"
			}
		},
		"requested_predicates": {
			"predicate1_referent": {
				// predicate name
				"name": "<predicate_name>",
				// predicate type, as of 2018-10-24: only '>=' seems to be supported
				"p_type": ">=",
				// predicate value to check against
				"p_value": "<value>",
				// restrictions similar to requested_attributes
				"restrictions": [{ "cred_def_id": "<cred_def_id>" }]
			}
		}
	} // authcrypted
} // anoncrypted
```

## Proof

- As of 2018-10-11, this message is not defined by indy-agent
- inner message is authcrypted
- The below proof is an example taken from https://www.npmjs.com/package/indy-sdk#provercreateproof--wh-proofreq-requestedcredentials-mastersecretname-schemas-credentialdefs-revstates----proof (2018-10-25)
- 2018-11-01: nonce MUST be numerical

```javascript
{ // anoncrypted
	id: <requestNonce>,
	// pairwise did of sender
	origin: <myDid>,
	type: "urn:sovrin:agent:message_type:sovrin.org/proof",
	message: { // authcrypted, below is just an example, this is whatever indy-sdk returns on proof creation
		"requested_proof": {
			"revealed_attrs": {
				"requested_attr1_id": {sub_proof_index: number, raw: string, encoded: string},
				"requested_attr4_id": {sub_proof_index: number: string, encoded: string},
			},
			"unrevealed_attrs": {
				"requested_attr3_id": {sub_proof_index: number}
			},
			"self_attested_attrs": {
				"requested_attr2_id": self_attested_value,
			},
			"requested_predicates": {
				"requested_predicate_1_referent": {sub_proof_index: int},
				"requested_predicate_2_referent": {sub_proof_index: int},
			}
		},
		"proof": {
			"proofs": [ <credential_proof>, <credential_proof>, <credential_proof> ],
			"aggregated_proof": <aggregated_proof>
		},
		"identifiers": [{schema_id, cred_def_id, Optional<rev_reg_id>, Optional<timestamp>}]
	} // authcrypted
} // anoncrypted
```
