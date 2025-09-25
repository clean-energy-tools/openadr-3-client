# OpenADR 3 Client Library

This directory is a project providing good quality API client functions for the OpenADR 3 protocol.

OpenADR 3 is defined by the OpenADR Alliance (https://www.openadr.org/).  It is a modern REST-style API defined using an OpenAPI 3 YAML file, plus a set of JSON schemas.  The specification is only available to those who register with the Allaince.  Because I am part of the technical team steering the OpenADR 3 project, I have a copy of the specification on my disk.

It uses the OpenADR 3 data types and data validation functions defeined in the OpenADR 3 types package.  That package is located at ../openadr-3-ts-types relative to this directory.

The OpenADR 3 specification is located in the directory ../specification

The OpenADR 3.1.0 specification is current, and is located in the directory ../specification/3.1.0

The intention is to provide OpenADR 3 client API functions for the following programming platforms:

* Node.js
* Python
* Java
* Go
* Rust
* Zig

# OpenADR 3 protocol overview

OpenADR 3 is a REST API running over HTTPS using OAuth2 Client Credential Flow for authentication and authorization.  It can be used over HTTP and with no authentication, primarily for development.

OpenADR in general targets energy services, specifically the operation of Demand/Response programs.  These are where an organization like a Electricity Utility publishes energy services requests over the Internet.  Devices installed in the field will pick up those requests and choose whether to respond.  A typical demand/response event is when electricity demand is too high, the electric grid is overloaded, and the electricity utility wants to reduce electricity consumption.  However, the protocol can be used for many other purposes.

The OpenADR model has two kinds of REST agents

1. Virtual Top Node (VTN): This is operated by the electricity utility, and is the resource server containing data about demand/response programs, demand/response events, and more.  There will be only one VTN.
2. Virtual End Node (VEN): These are the devices that manage equipment installed in the field.  Examples are pool pumps, large refrigeration units, air conditioning systems, electric vehicle charging stations, energy storage devices, and the like.  There will be many VENs.

In typical REST client/server nomenclature, the VTN is a resource server, and the VENs are clients to this server.

# Technology selection

This package consists of functions implementing the OpenADR 3 client API.  For each supported programming platform, there dependencies on other packages providing functional service.  We must select the best such packages.

* Making HTTP/HTTPS REST requests: This dependendency is to satisfy the ability to make GET/POST/PUT/DELETE requests over an HTTP/HTTPS connection to an OpenADR 3 VTN.

The choices made for each platform are:

* Node.js
    * HTTP/HTTPS REST requests: The `fetch()` API support that's now baked into Node.js should be sufficient.  For Deno, and Bun, I believe both also implement the `fetch()` API.


# The OpenADR 3 specification

The specification is written in OpenAPI format.

Data types must be defined from the schema definitions in `../specification/3.1.0/openadr3.yaml`. The data types come from these areas:

* The `components/schemas` section, which contains schema declarations for each object.  
* Within the `paths` section:
    * Some API endpoints have `parameters`, and the parameters can be converted into a data type describing all the parameters.
    * The API endpoints have `responses`, each of which can be converted into a data type.

The companion project, in ../openadr-3-ts-types, contains data type declarations and data validation functions derived from tho OpenADR 3 specification.

This package will consist of functions corresponding to the endpoints defined in the `paths` section.  Each function will have these characteristics:

* The name for the function is equal to the `operationId` for the `paths` entry.  This is the handler function for that operation.
* The steps the function must follow are almost the same in all cases:
  1. For an endpoint which takes parameters, the function will have corresponding function parameters, and each parameter will have the corresponding data type.
  2. Within the funnction, any parameters must be checked using the data validation functions in `openadr-3-ts-types`
  3. This function must gather both the required API parameters and request body
  4. The function must also ensure it has the OAuth2 authorization token, if needed
  5. The function then encodes the parameters and request body as required by the endpoint definition, and uses the chosen HTTP/HTTPS package to transmit the request using GET/PUT/POST/DELETE as appropriate
  6. When the response arrives, the function must examine whether it was a success or failure, and return the appropriate information

The following examples suggest the return value could be a structure containing a status code, the response object, and a field named `problem` containing an error object.

Remember that the parameter list includes both any positional parameters in the path, as well as the parameters named in the `paths` entry.  For example the `deleteProgram` operation has a path, `/programs/{programID}`, where `programID` is a path parameter.

A GET operation would therefore look like this (using TypeScript syntax):

```typescript
export async searchAllPrograms(
    targets?: Array<Target>,
    skip?: number,
    limit?: number
): Promise<{
    status: number, // HTTP response code
    response?: Program,
    problem?: BadRequest | Unauthorized | Forbidden | InternalServerError
}> {
    // Step 1. Validate the input parameters

    // Step 2. Retrieve the OAuth2 auth token
    //         This ahould auto-renew the token if expired

    // Step 3. Invoke the GET operation 

    // Step 4. Examine the response

    // Step 5. If an error, create the correct Error object
    //         for the problem field
    // Otherwise set the response field to the decided response.
}
```

A POST or PUT operation would look like this (using TypeScript syntax):

```typescript
export async function createProgram( // or updateProgram
    program: ProgramRequest
) : Promise<{
    status: number,
    response?: Program,
    problem?: Problem
}> {
    // Step 1. Validate the input parameters

    // Step 2. Retrieve the OAuth2 auth token
    //         This ahould auto-renew the token if expired

    // Step 3. Invoke the POST or PUT operation 

    // Step 4. Examine the response

    // Step 5. If an error, create the correct Error object
    //         for the problem field
    // Otherwise set the response field to the decided response.
}
```

A DELETE operation would look like this (using TypeScript syntax):

```typescript
export async function deleteProgram(
    programID: ObjectID
) : Promise<{
    status: number,
    response?: Program,
    problem?: BadRequest | Unauthorized | Forbidden | NotFound | InternalServerError
}> {
    // Step 1. Validate the input parameters

    // Step 2. Retrieve the OAuth2 auth token
    //         This ahould auto-renew the token if expired

    // Step 3. Invoke the DELETE operation 

    // Step 4. Examine the response

    // Step 5. If an error, create the correct Error object
    //         for the problem field
    // Otherwise set the response field to the decided response.
}
```
