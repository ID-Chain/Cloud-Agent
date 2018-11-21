
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
  "swaggerDoc": {
    "swagger": "2.0",
    "info": {
      "description": "IdentityChain Agent REST API",
      "title": "IdentityChain API",
      "version": "0.1.5"
    },
    "schemes": [
      "http",
      "https"
    ],
    "securityDefinitions": {
      "basic": {
        "type": "basic"
      }
    },
    "consumes": [
      "application/json"
    ],
    "produces": [
      "application/json"
    ],
    "parameters": {
      "userParam": {
        "name": "user",
        "in": "path",
        "description": "A unique id (or 'me') value identifying this user.",
        "type": "string",
        "required": true
      },
      "walletParam": {
        "name": "wallet",
        "in": "path",
        "description": "A unique id value identifying this wallet.",
        "type": "string",
        "required": true
      }
    },
    "definitions": {
      "user_post": {
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "password": {
            "type": "string"
          }
        },
        "required": [
          "username",
          "password"
        ]
      },
      "user_put": {
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "password": {
            "type": "string"
          }
        }
      },
      "wallet_post": {
        "type": "object",
        "properties": {
          "name": {
            "description": "(Optional) Wallet name, must be globally unique. Automatically generated if none is provided.",
            "type": "string"
          },
          "config": {
            "description": "(Optional) Wallet Config JSON. Supported keys vary by wallet type. A default config will be used if none is provided.",
            "type": "string"
          },
          "credentials": {
            "description": "Wallet Credentials JSON. Supported keys vary by wallet type. A default config will be used if none is provided.",
            "type": "object",
            "properties": {
              "key": {
                "description": "Passphrase used to derive wallet master key",
                "type": "string"
              }
            }
          },
          "poolName": {
            "description": "(Optional) Name of the Pool to associate with this wallet. A default config will be used if none is provided.",
            "type": "string"
          },
          "seed": {
            "description": "(Optional) Seed to use for initial did creation.",
            "type": "string"
          },
          "xtype": {
            "description": "(Optional) Type of the wallet. A default config will be used if none is provided.",
            "type": "string"
          }
        }
      },
      "credential_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "encryptedCredential": {
            "description": "The authcrypted credential offer id",
            "type": "string"
          }
        },
        "required": [
          "wallet",
          "encryptedCredential"
        ]
      },
      "credentialissue_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "encryptedCredentialRequest": {
            "description": "The authcrypted Credential Request",
            "type": "string"
          },
          "values": {
            "description": "Object containing attributes defined in schema as key-value pairs (e.g. {\"attrName\":\"attrValue\", \"attrName1\":\"attrValue1\"})",
            "type": "object"
          }
        },
        "required": [
          "wallet",
          "encryptedCredentialRequest"
        ]
      },
      "credentialdef_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "schemaId": {
            "description": "A unique string value identifying a schema",
            "type": "string"
          },
          "supportRevocation": {
            "description": "(Optional) States if revocation should be supported for this credential definiton",
            "type": "boolean",
            "default": false
          }
        },
        "required": [
          "wallet",
          "schemaId"
        ]
      },
      "credentialoffer_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "recipientDid": {
            "description": "DID for whom to create a credential offer",
            "type": "string"
          },
          "credDefId": {
            "description": "Credential definition id",
            "type": "string"
          }
        },
        "required": [
          "wallet",
          "recipientDid",
          "credDefId"
        ]
      },
      "credentialrequest_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "encryptedCredentialOffer": {
            "description": "auth crypted credential offer",
            "type": "string"
          }
        },
        "required": [
          "wallet",
          "encryptedCredentialOffer"
        ]
      },
      "connectionoffer_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "endpoint": {
            "description": "Response endpoint for connection response",
            "type": "string"
          },
          "role": {
            "description": "Role offered to the connection invitee",
            "type": "string",
            "enum": [
              "NONE",
              "TRUSTEE",
              "STEWARD",
              "TRUST_ANCHOR"
            ]
          }
        },
        "required": [
          "wallet"
        ]
      },
      "connection_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "endpoint": {
            "description": "Endpoint for communication with accepting user",
            "type": "string"
          },
          "connectionOffer": {
            "description": "The connection offer object",
            "type": "object"
          }
        },
        "required": [
          "wallet",
          "connectionOffer"
        ]
      },
      "proofrequest_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "recipientDid": {
            "description": "DID for whom to create a proof request",
            "type": "string"
          },
          "proofRequest": {
            "description": "proof request object (see https://github.com/hyperledger/indy-sdk/blob/master/doc/getting-started/getting-started.md#apply-for-a-job)",
            "type": "object",
            "example": {
              "name": "Ticket",
              "version": "0.1",
              "requested_attributes": {
                "attr1_referent": {
                  "name": "firstname",
                  "restrictions": [
                    {
                      "cred_def_id": "XsjEewC463EYaXeQZcsWND:3:CL:19"
                    }
                  ]
                },
                "attr2_referent": {
                  "name": "lastname",
                  "restrictions": [
                    {
                      "cred_def_id": "XsjEewC463EYaXeQZcsWND:3:CL:19"
                    }
                  ]
                },
                "attr3_referent": {
                  "name": "phone"
                }
              },
              "requested_predicates": {}
            }
          }
        },
        "required": [
          "wallet",
          "recipientDid",
          "proofRequest"
        ]
      },
      "proof_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "encryptedProofRequest": {
            "description": "Encrypted Proof Request",
            "type": "string"
          },
          "selfAttestedAttributes": {
            "description": "(Optional) Object containing self-attested-attributes as key-value pairs",
            "type": "object",
            "example": {
              "phone": "00001111"
            }
          }
        },
        "required": [
          "wallet",
          "encryptedProofRequest"
        ]
      },
      "proofverification_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "encryptedProof": {
            "description": "Encrypted Proof",
            "type": "string"
          }
        },
        "required": [
          "wallet",
          "encryptedProof"
        ]
      },
      "schema_post": {
        "type": "object",
        "properties": {
          "wallet": {
            "description": "A unique string value identifying a wallet",
            "type": "string"
          },
          "name": {
            "description": "A unique name of the schema",
            "type": "string"
          },
          "version": {
            "description": "version for schema",
            "type": "string"
          },
          "attrNames": {
            "description": "list of attribute names put into the schema",
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "wallet",
          "name",
          "version",
          "attrNames"
        ]
      }
    },
    "paths": {
      "/api/credential/": {
        "get": {
          "summary": "List all credentials of specific wallet (UNTESTED ENDPOINT)",
          "description": "List all credentials of specific wallet (UNTESTED ENDPOINT)",
          "parameters": [
            {
              "in": "header",
              "name": "wallet",
              "description": "A unique string value identifying a wallet.",
              "required": true,
              "type": "string"
            },
            {
              "in": "query",
              "name": "schema",
              "type": "string",
              "description": "schemaId to filter credentials"
            },
            {
              "in": "query",
              "name": "schemaIssuerDid",
              "type": "string",
              "description": "schemaIssuerDid to filter credentials"
            },
            {
              "in": "query",
              "name": "schemaName",
              "type": "string",
              "description": "schemaName to filter credentials"
            },
            {
              "in": "query",
              "name": "schemaVersion",
              "type": "string",
              "description": "schemaVersion to filter credentials"
            },
            {
              "in": "query",
              "name": "issuerDid",
              "type": "string",
              "description": "issuerDid to filter credentials"
            },
            {
              "in": "query",
              "name": "credDefId",
              "type": "string",
              "description": "credDefId to filter credentials"
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "credential"
          ]
        },
        "post": {
          "summary": "Store a credential",
          "description": "Store a credential",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/credential_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "credential"
          ]
        }
      },
      "/api/credential/{id}/": {
        "parameters": [
          {
            "description": "A unique string value identifying this credential.",
            "in": "path",
            "name": "id",
            "required": true,
            "type": "string"
          },
          {
            "in": "header",
            "description": "A unique string value identifying a wallet.",
            "name": "wallet",
            "required": true,
            "type": "string"
          }
        ],
        "get": {
          "summary": "Retrieve a credential",
          "description": "Retrieve a credential",
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "credential"
          ]
        }
      },
      "/api/credentialissue/": {
        "post": {
          "summary": "Issue a credential",
          "description": "Issue a credential",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/credentialissue_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "credentialissue"
          ]
        }
      },
      "/api/credentialdef/": {
        "get": {
          "summary": "List credential definitions of wallet",
          "description": "List credential definitions of wallet",
          "parameters": [
            {
              "in": "header",
              "name": "wallet",
              "required": true,
              "type": "string"
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "credentialdef"
          ]
        },
        "post": {
          "summary": "Create a credential definition",
          "description": "Create a credential definition",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/credentialdef_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "credentialdef"
          ]
        }
      },
      "/api/credentialdef/{creddef}/": {
        "parameters": [
          {
            "description": "A unique string value identifying this credential definition.",
            "in": "path",
            "name": "creddef",
            "required": true,
            "type": "string"
          },
          {
            "description": "A unique string value identifying the wallet to be used.",
            "in": "header",
            "name": "wallet",
            "required": true,
            "type": "string"
          }
        ],
        "get": {
          "summary": "Retrieve a credential definition from the ledger",
          "description": "Retrieve a credential definition from the ledger",
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "credentialdef"
          ]
        },
        "delete": {
          "summary": "Delete a credential definition",
          "description": "Delete a credential definition",
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "credentialdef"
          ]
        }
      },
      "/api/credentialoffer/": {
        "post": {
          "summary": "Create a credential offer",
          "description": "Create a credential offer",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/credentialoffer_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "credentialoffer"
          ]
        }
      },
      "/api/credentialrequest/": {
        "post": {
          "summary": "Accept credential offer and create credential request",
          "description": "Accept credential offer and create credential request",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/credentialrequest_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "credentialrequest"
          ]
        }
      },
      "/api/connectionoffer/": {
        "post": {
          "summary": "Create a new connection offer",
          "description": "Create a new connection offer",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/connectionoffer_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "connection"
          ]
        }
      },
      "/api/connection/": {
        "post": {
          "summary": "Accept a connection offer",
          "description": "Accept a connection offer",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/connection_post"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success"
            }
          },
          "tags": [
            "connection"
          ]
        }
      },
      "/api/proofrequest/": {
        "post": {
          "summary": "Create a proof request",
          "description": "Create a proof request",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "type": "object",
              "schema": {
                "$ref": "#/definitions/proofrequest_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "proof"
          ]
        }
      },
      "/api/proof/": {
        "post": {
          "summary": "Create a Proof",
          "description": "Create a Proof",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "type": "object",
              "schema": {
                "$ref": "#/definitions/proof_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "proof"
          ]
        }
      },
      "/api/proofverification/": {
        "post": {
          "summary": "Create a proof verification",
          "description": "Create a proof verification",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/proofverification_post"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "proof"
          ]
        }
      },
      "/api/schema/": {
        "get": {
          "summary": "List schemas",
          "description": "List schemas",
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "schema"
          ]
        },
        "post": {
          "summary": "Create a Schema",
          "description": "Create a Schema",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/schema_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "schema"
          ]
        }
      },
      "/api/schema/{schemaid}/": {
        "parameters": [
          {
            "description": "A unique string value identifying this schema.",
            "in": "path",
            "name": "schemaid",
            "required": true,
            "type": "string"
          },
          {
            "description": "A unique value identifying this wallet.",
            "in": "header",
            "name": "wallet",
            "required": true,
            "type": "string"
          }
        ],
        "get": {
          "summary": "Retrieve a schema",
          "description": "Retrieve a schema",
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "schema"
          ]
        }
      },
      "/api/user/": {
        "post": {
          "summary": "Register a new user",
          "description": "Register a new user",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/user_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": "User successfully created",
              "headers": {
                "Location": {
                  "description": "Path to created user, e.g. /user/userId",
                  "type": "string"
                }
              }
            }
          },
          "tags": [
            "user"
          ]
        }
      },
      "/api/user/{user}/": {
        "parameters": [
          {
            "$ref": "#/parameters/userParam"
          }
        ],
        "get": {
          "summary": "Retrieve a user",
          "description": "Retrieve a user",
          "responses": {
            "200": {
              "description": "Success"
            }
          },
          "tags": [
            "user"
          ]
        },
        "put": {
          "summary": "Update a User",
          "description": "Update a User (at least one of the properties must be provided)",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/user_put"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success"
            },
            "501": {
              "description": "Not yet implemented"
            }
          },
          "tags": [
            "user"
          ]
        },
        "delete": {
          "summary": "Delete a User",
          "description": "Delete a User",
          "parameters": [
            {
              "$ref": "#/parameters/userParam"
            }
          ],
          "responses": {
            "204": {
              "description": ""
            },
            "501": {
              "description": "Not yet implemented"
            }
          },
          "tags": [
            "user"
          ]
        }
      },
      "/api/wallet/": {
        "get": {
          "summary": "List all wallets of user",
          "description": "List all wallets of user",
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "wallet"
          ]
        },
        "post": {
          "summary": "Create a new Wallet (optionally with given name and settings)",
          "description": "Create a new Wallet (optionally with given name and settings)",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "$ref": "#/definitions/wallet_post"
              }
            }
          ],
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "wallet"
          ]
        }
      },
      "/api/wallet/{wallet}/": {
        "parameters": [
          {
            "$ref": "#/parameters/walletParam"
          }
        ],
        "get": {
          "summary": "Retrieve a Wallet.",
          "description": "Retrieve a Wallet.",
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "wallet"
          ]
        },
        "delete": {
          "summary": "Delete a Wallet",
          "description": "Delete a Wallet",
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "wallet"
          ]
        }
      },
      "/api/endpoint/": {
        "post": {
          "description": "Agent endpoint",
          "summary": "Agent endpoint",
          "parameters": [
            {
              "in": "body",
              "name": "data",
              "schema": {
                "properties": {
                  "type": {
                    "description": "Message encryption type",
                    "type": "string",
                    "default": "anon",
                    "enum": [
                      "anon",
                      "auth"
                    ]
                  },
                  "target": {
                    "description": "Reason for the message",
                    "type": "string",
                    "enum": [
                      "accept_connection"
                    ]
                  },
                  "ref": {
                    "description": "A reference value, e.g. nonce",
                    "type": "string"
                  },
                  "message": {
                    "description": "Encrypted message string",
                    "type": "string"
                  },
                  "signature": {
                    "description": "Message Signature",
                    "type": "string"
                  }
                },
                "required": [
                  "target",
                  "ref",
                  "message",
                  "signature"
                ],
                "type": "object"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "endpoint"
          ]
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
