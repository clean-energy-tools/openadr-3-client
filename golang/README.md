# OpenADR 3 Client for Go

A Go client library for the OpenADR 3.1.0 protocol.

## Installation

```bash
go mod tidy
```

## Building

```bash
go build ./...
```

## Usage

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/openadr/openadr-3-client/golang"
)

func main() {
    // Create client configuration
    config := oadr3client.OADR3Config{
        BaseURL:      "https://your-vtn-server.com",
        ClientID:     "your-client-id",
        ClientSecret: "your-client-secret",
        Scope:        "read_targets", // optional
    }

    // Create client
    client := oadr3client.NewOADR3(config)

    // Search for programs
    ctx := context.Background()
    programs, err := client.SearchAllPrograms(ctx, nil, nil, nil)
    if err != nil {
        log.Fatalf("Error searching programs: %v", err)
    }

    if programs.Problem != nil {
        fmt.Printf("API Error: %v\n", programs.Problem)
        return
    }

    fmt.Printf("Found %d programs\n", len(*programs.Response))
}
```

## Features

- **OAuth2 Authentication**: Automatic token management using Client Credentials flow
- **Complete API Coverage**: All OpenADR 3.1.0 operations implemented
- **Input/Output Validation**: Request and response validation using OpenADR 3 types
- **Context Support**: Full Go context support for cancellation and timeouts
- **Type Safety**: Strong typing with generated OpenADR 3 types
- **Generics**: Uses Go generics for type-safe API responses

## API Methods

### Programs
- `SearchAllPrograms(ctx, targets, skip, limit)`
- `CreateProgram(ctx, program)`
- `SearchProgramByProgramID(ctx, programID)`
- `UpdateProgram(ctx, programID, program)`
- `DeleteProgram(ctx, programID)`

### Events
- `SearchAllEvents(ctx, programID, skip, limit)`
- `CreateEvent(ctx, event)`

### Reports
- `SearchAllReports(ctx, programID, clientName, skip, limit)`
- `CreateReport(ctx, report)`

### VENs
- `SearchVens(ctx, venName, skip, limit)`
- `CreateVen(ctx, ven)`

## Configuration

The `OADR3Config` struct requires:

- `BaseURL`: The VTN server base URL
- `ClientID`: OAuth2 client ID
- `ClientSecret`: OAuth2 client secret  
- `Scope`: Optional OAuth2 scope

## Error Handling

All methods return a response object with the following structure:

```go
type APIResponse[T any] struct {
    Status   int    `json:"status"`          // HTTP status code
    Response *T     `json:"response,omitempty"` // Response data if successful
    Problem  *Error `json:"problem,omitempty"`  // Error information if failed
}
```

## Requirements

- Go 1.21 or later
- Access to OpenADR 3 types package (dependency handled via go.mod replace directive)

## Dependencies

- `golang.org/x/oauth2` - OAuth2 client implementation
- `github.com/clean-energy-tools/openadr-3-types/golang/package` - OpenADR 3 types and validation

## License

Apache 2.0