# OpenADR 3 Client Library

This directory contains client libraries for the OpenADR 3 protocol, a REST-based API for automated Demand/Response energy programs.

## Project Overview

OpenADR 3 is defined by the OpenADR Alliance and provides a modern REST API for energy services communication between:
- **VTN (Virtual Top Node)**: Resource server operated by utilities containing demand/response programs and events
- **VEN (Virtual End Node)**: Client devices managing field equipment like pool pumps, HVAC, EV chargers, etc.

## High-Level Goal

**The primary goal is to implement comprehensive OpenADR 3 client function libraries for multiple programming platforms.** This multi-platform approach ensures OpenADR 3 adoption across diverse development ecosystems.

### Target Platforms
The project aims to provide client libraries for the same platforms supported by the companion project in `../openadr-3-ts-types`:

- **Go**: High-performance systems and cloud infrastructure
- **Node.js/TypeScript**: Web services and JavaScript ecosystem  
- **Python**: Data science, IoT, and rapid development
- **Java**: Enterprise applications and Android development
- **Rust**: Systems programming and high-reliability applications
- **Zig**: Low-level systems and embedded applications

Each platform implementation will provide identical functionality while following platform-specific conventions and best practices.

## Directory Structure

```
/
├── node-old/              # Legacy Node.js implementation
│   ├── src/
│   │   ├── openapi-typescript/
│   │   │   └── oadr3.ts   # Generated OpenADR 3 types
│   │   ├── api.ts         # Core API functions
│   │   └── client.ts      # Main client implementation
│   ├── test/              # Test files for all OpenADR operations
│   ├── package.json
│   └── tsconfig.json
├── node-examples/         # Example implementations using different tools
│   ├── openapi-codegen/
│   ├── openapi-generator/
│   ├── openapi-stack-axios/
│   └── openapi-typescript-fetch/
├── node-cli-old/         # CLI tool implementation
├── DESIGN.md             # Detailed design documentation
└── README.md             # Project overview
```

## Dependencies

### External Dependencies
- **OpenADR 3 Types**: Located at `../openadr-3-ts-types` - provides data types and validation functions
- **OpenADR 3 Specification**: Located at `../specification/3.1.0/openadr3.yaml` - OpenAPI specification

### Technology Stack
- **Node.js/TypeScript**: Primary implementation using built-in `fetch()` API for HTTP requests
- **OAuth2 Client Credentials Flow**: For authentication with VTN servers
- **OpenAPI 3**: Specification format for API definitions

## Key Features

Each client library implementation should provide:
1. **OAuth2 Configuration**: Support for `client_id`, `client_secret`, and `scope` tokens
2. **Token Management**: Automatic retrieval and renewal of OAuth2 access tokens  
3. **Complete API Coverage**: All REST methods matching OpenADR 3 `operationId` values
4. **Data Validation**: Request/response validation using OpenADR 3 type definitions
5. **Error Handling**: Proper handling of HTTP status codes and OpenADR error responses

## Build/Test Instructions

### Node.js Implementation (node-old/)
```bash
cd node-old/
npm install
npm run build    # If build script exists
npm test         # Run test suite
```

### Testing
The `node-old/test/` directory contains comprehensive tests for all OpenADR 3 operations:
- Authentication (`test.auth.js`)
- Events (`test.events.js`) 
- Programs (`test.programs.js`)
- Reports (`test.reports.js`)
- Resources (`test.resources.js`)
- Subscriptions (`test.subscriptions.js`)
- VENs (`test.vens.js`)

## Usage Guidelines

### Function Patterns
All API functions follow a consistent pattern:
- Function name matches OpenADR 3 `operationId`
- Parameters include path parameters and query parameters
- Returns Promise with `{status, response?, problem?}` structure
- Automatic OAuth2 token handling
- Input/output validation using OpenADR 3 types

### Example Function Signature
```typescript
export async function searchAllPrograms(
    targets?: Array<Target>,
    skip?: number, 
    limit?: number
): Promise<{
    status: number,
    response?: Program,
    problem?: BadRequest | Unauthorized | Forbidden | InternalServerError
}>
```

## Development Notes

- **Specification Access**: OpenADR 3 specification requires Alliance registration
- **Multi-Platform Support**: Planned support for Node.js, Python, Java, Go, Rust, Zig
- **Current Status**: Node.js implementation in progress, examples exploring different toolchains
- **Code Generation**: Exploring various OpenAPI code generation tools in `node-examples/`

## Related Files

- `DESIGN.md`: Detailed technical design and implementation approach
- `../specification/3.1.0/`: OpenADR 3.1.0 specification files
- `../openadr-3-ts-types/`: TypeScript type definitions and validation functions