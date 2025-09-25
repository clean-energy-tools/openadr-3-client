# OpenADR 3 Client for Node.js

A TypeScript/Node.js client library for the OpenADR 3.1.0 protocol.

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Usage

```typescript
import { OADR3 } from 'openadr-3-client';

const client = new OADR3({
  baseUrl: 'https://your-vtn-server.com',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  scope: 'read_targets' // optional
});

// Search for programs
const programs = await client.searchAllPrograms();

// Create a new program
const newProgram = await client.createProgram({
  programName: 'My Program',
  programType: 'PRICING_TARIFF',
  // ... other program properties
});
```

## Features

- **OAuth2 Authentication**: Automatic token management using Client Credentials flow
- **Complete API Coverage**: All OpenADR 3.1.0 operations implemented
- **Input/Output Validation**: Request and response validation using OpenADR 3 types
- **Modern Node.js**: Uses built-in `fetch()` API, targets Node.js v24+
- **ESM Modules**: Full ES modules support with TypeScript

## API Methods

### Programs
- `searchAllPrograms(targets?, skip?, limit?)`
- `createProgram(program)`
- `searchProgramByProgramId(programID)`
- `updateProgram(programID, program)`
- `deleteProgram(programID)`

### Events
- `searchAllEvents(programID?, targetType?, targetValues?, skip?, limit?)`
- `createEvent(event)`

### Reports
- `searchAllReports(programID?, clientName?, reportRequestID?, reportSpecifierID?, skip?, limit?)`
- `createReport(report)`

### VENs
- `searchVens(venName?, skip?, limit?)`
- `createVen(ven)`

### Authentication
- `fetchToken()` - Get OAuth2 access token

## Configuration

The OADR3 class requires a configuration object with:

- `baseUrl`: The VTN server base URL
- `clientId`: OAuth2 client ID
- `clientSecret`: OAuth2 client secret  
- `scope`: Optional OAuth2 scope (defaults to required scopes)

## Error Handling

All methods return a Promise with an `APIResponse` object containing:

```typescript
{
  status: number;        // HTTP status code
  response?: T;          // Response data if successful
  problem?: any;         // Error information if failed
}
```

## Requirements

- Node.js v24 or later
- TypeScript (for development)

## License

Apache 2.0