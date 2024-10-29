# Test suite for openadr-3-client

This test suite checks a portion of OpenADR 3 functionality by invoking the REST endpoints.  The goal in this case is not to implement a complete OpenADR 3 test suite, but to exercise the client library enough to be confident that it works.

## Setup required

Before running the tests we must configure `env.sh` with some environment variables read by the test suite.

An example setup:

```sh
OADR3URL=http://localhost:9000/api/openadr/0.1/

VEN_CLIENT_NAME=VEN
OAUTH_VEN_CLIENT_ID=085c9713-48df-407c-9fc9-b18213d9bb89
OAUTH_VEN_CLIENT_SECRET=kttzrb0gZZ2sOc_eaUaMetzh2T
OAUTH_VEN_SCOPE=read_all write_reports write_subscriptions write_vens


ALL_NAME=BLany
OAUTH_ALL_CLIENT_ID=46b18ced-6eae-40aa-bc44-356a0a05998a
OAUTH_ALL_CLIENT_SECRET=EBHL7My-0pTirLg_oKsNO-fQTf
OAUTH_ALL_SCOPE=read_all write_reports write_subscriptions write_vens write_programs write_events
```

The variables are:

* `OADR3URL` - The URL for the OpenADR 3 server to which the client will connect.
* `VEN_CLIENT_NAME` - The name for a VEN client.
* `OAUTH_VEN*` - This prefix is several variables for configuring the VEN client.
* `ALL_NAME` - The name for a client with full access to all scopes.
* `OAUTH_ALL*` - This prefix is several variables for configuring the ALL client.

The tests use two clients, where they differ by the scope strings.  The VEN client has scopes corresponding to VEN operations, while the ALL client has scopes listing all OpenADR 3 scopes.

At the time of this writing, the test suite only exercises the ALL client.  Tests of the VEN client should ensure that when the VEN client makes requests it isn't allowed to perform, that those requests fail appropriately.

The generation of these client objects depends on the tools in your OpenADR 3 VTN.

## Test implementation

The test suites is structured where each `test.COMPONENT.js` file tests the corresponding portion of the OpenADR 3 specification.

The tests are written in plain ESM JavaScript using the `node:test` package built-in to Node.js.

The `test.auth.js` suite must be executed first, as it sets up the client objects.

Before running tests, execute `npm install` in the `test` directory to install dependencies.

To run the tests, execute `npm test`.  This will use `nodemon` to watch for changes and automatically rerun tests.


