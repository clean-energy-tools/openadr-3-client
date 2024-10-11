# Client library/libraries for OpenADR 3

OpenADR v3 is a REST-based protocol for implementing automated Demand/Response programs.  By following the REST model it means both VTN (Virtual Top Node) and VEN (Virtual End Node) applications can be written in any programming language, and are hosted on Internet-facing server systems.

This project aims to accelerate OpenADR 3 adoption by providing OpenADR 3.x client libraries for multiple programming platforms.

An OpenADR 3 client library should have this functionality:

* Configuration with `client_id`, `client_secret`, and `scope` tokens for OAuth2 authentication.
* Retrieving OAuth2 access tokens using those secrets.
* Implementation of every REST method in the OpenADR 3 specification.  The method name must match the _operationId_ value, take the same parameters, formatting them as required to make the REST call.
* Validating request data before sending it to the VTN.
* Validating response data sent by the VTN.

Project contents:

* [node](./node/README.md) Node.js/TypeScript package implementing the OpenADR 3 methods.  All data is validated when sent to a VTN, and upon receipt from the VTN.


