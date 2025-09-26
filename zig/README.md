# OpenADR 3 Zig Client

A comprehensive Zig client library for the OpenADR 3.1.0 protocol, providing OAuth2 authentication and complete API coverage with Zig's memory safety and performance guarantees.

## Features

- **🔐 OAuth2 Authentication**: Automatic token management using Client Credentials flow
- **🚀 Complete API Coverage**: All OpenADR 3.1.0 operations implemented
- **✅ Input/Output Validation**: Request and response validation using OpenADR 3 types
- **🛡️ Memory Safety**: Full Zig compile-time memory safety guarantees
- **⚡ Performance**: Zero-overhead abstractions with Zig's performance-first design
- **🧵 Thread Safety**: Built-in mutex protection for OAuth2 token caching
- **📦 Mock Implementation**: Ready for testing with mock responses

## Requirements

- **Zig 0.15.1 or later**
- Compatible with all platforms supported by Zig

## Quick Start

### Installation

Clone the repository and add to your `build.zig`:

```zig
const openadr3_dep = b.dependency("openadr3-client", .{
    .target = target,
    .optimize = optimize,
});
const openadr3_mod = openadr3_dep.module("openadr3");
exe.addModule("openadr3", openadr3_mod);
```

### Basic Usage

```zig
const std = @import("std");
const openadr3 = @import("openadr3");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();
    
    // Configure the client
    const config = try openadr3.OADR3Config.init(
        "https://your-vtn-server.com",
        "your-client-id",
        "your-client-secret",
    );
    
    const client_config = config
        .withScope("read_targets write_programs")
        .withTimeout(60);
    
    var client = try openadr3.OADR3.init(allocator, client_config);
    defer client.deinit();
    
    // Search for programs
    const programs = try client.searchAllPrograms(null, null, null);
    defer programs.deinit(allocator);
    
    if (programs.isSuccess()) {
        if (programs.getData()) |program_list| {
            std.debug.print("Found {d} programs\\n", .{program_list.len});
            
            // Clean up program data
            for (program_list) |program| {
                program.deinit(allocator);
            }
        }
    }
}
```

## Configuration

The `OADR3Config` struct allows you to configure the client:

```zig
const config = try openadr3.OADR3Config.init(
    "https://your-vtn-server.com",  // VTN server URL
    "your-client-id",               // OAuth2 client ID
    "your-client-secret"            // OAuth2 client secret
);

// Optional configuration
const client_config = config
    .withScope("read_targets write_programs")  // OAuth2 scope
    .withTimeout(60);                          // Request timeout in seconds
```

### Configuration Methods

- `init(base_url, client_id, client_secret)` - Create new configuration
- `withScope(scope)` - Set OAuth2 scope
- `withTimeout(seconds)` - Set request timeout
- `validate()` - Validate configuration parameters

## API Coverage

The client provides complete coverage of OpenADR 3.1.0 APIs:

### Programs API
```zig
// Search and filter programs
const programs = try client.searchAllPrograms(targets, skip, limit);

// Create new demand response programs  
const created = try client.createProgram(program);

// Retrieve program by ID
const program = try client.getProgram("program-id");

// Update existing programs
const updated = try client.updateProgram("program-id", program);

// Remove programs
const deleted = try client.deleteProgram("program-id");
```

### Events API
```zig
// Search events for a program
const events = try client.searchEvents("program-id", skip, limit);

// Create new demand response events
const created = try client.createEvent("program-id", event);

// Retrieve event by ID
const event = try client.getEvent("program-id", "event-id");

// Update existing events
const updated = try client.updateEvent("program-id", "event-id", event);

// Remove events
const deleted = try client.deleteEvent("program-id", "event-id");
```

### Reports API
```zig
// Search usage and performance reports
const reports = try client.searchReports(program_id, skip, limit);
```

### VENs API
```zig
// Search Virtual End Nodes
const vens = try client.searchVens(skip, limit);
```

## Response Handling

All API methods return an `APIResponse(T)` wrapper with comprehensive error handling:

```zig
const programs = try client.searchAllPrograms(null, null, null);
defer programs.deinit(allocator);

if (programs.isSuccess()) {
    // Handle successful response
    if (programs.getData()) |data| {
        std.debug.print("Success: {d} programs\\n", .{data.len});
        
        // Clean up data
        for (data) |program| {
            program.deinit(allocator);
        }
    }
} else {
    // Handle error response
    if (programs.getError()) |err| {
        std.debug.print("API Error: {any}\\n", .{err});
    }
    
    std.debug.print("HTTP Status: {d}\\n", .{programs.status});
}

// Or convert to Result type
const data = try programs.toResult();
```

## Data Types

The client includes demo types for testing and development:

```zig
// Create a program
const program = try openadr3.types.DemoProgram.init(
    allocator,
    "program-123",
    "Peak Demand Response",
    "Pacific Gas & Electric", 
    "US",
    "CA",
    .demand_response,
    &[_]openadr3.types.DemoTargetType{.commercial},
);
defer program.deinit(allocator);

// Create an event
const now = std.time.timestamp();
const event = try openadr3.types.DemoEvent.init(
    allocator,
    "event-123",
    "program-123",
    "Peak Hour Event",
    "demand_response", 
    now + 3600,  // Start in 1 hour
    now + 7200,  // End in 2 hours
);
defer event.deinit(allocator);
```

### Type Safety

Zig's type system provides compile-time guarantees:

```zig
// Program types are validated at compile time
const program_type: openadr3.DemoProgramType = .demand_response;
const target_type: openadr3.DemoTargetType = .commercial;

// Convert to/from strings safely
const type_string = program_type.toString();
const parsed_type = openadr3.DemoProgramType.fromString("demand_response");
```

## Validation

All inputs are automatically validated using Zig's error handling:

```zig
// This will return a validation error
const invalid_program = try openadr3.types.DemoProgram.init(
    allocator,
    "",  // Empty ID will fail validation
    "Valid Name",
    "Valid Retailer",
    "US",
    null,
    .demand_response,
    &[_]openadr3.types.DemoTargetType{.commercial},
);

// Validation happens automatically
const result = client.createProgram(invalid_program) catch |err| switch (err) {
    openadr3.Error.InvalidProgramData => {
        std.debug.print("Program data is invalid\\n", .{});
        return;
    },
    else => return err,
};
```

### Validation Functions

```zig
// Validate individual items
try openadr3.validateProgram(program);
try openadr3.validateEvent(event);
try openadr3.validateSearchParams(skip, limit);

// Built-in validation helpers
try openadr3.validation.isValidUuid("123e4567-e89b-12d3-a456-426614174000");
try openadr3.validation.isValidCountryCode("US");
```

## Memory Management

Zig provides explicit memory management with compile-time safety:

```zig
pub fn main() !void {
    // Use GeneralPurposeAllocator for automatic leak detection
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();  // Detects leaks in debug mode
    const allocator = gpa.allocator();
    
    var client = try openadr3.OADR3.init(allocator, config);
    defer client.deinit();  // Clean up client resources
    
    const programs = try client.searchAllPrograms(null, null, null);
    defer programs.deinit(allocator);  // Clean up response
    
    if (programs.getData()) |data| {
        // Clean up individual items
        for (data) |program| {
            program.deinit(allocator);
        }
    }
}
```

## Error Handling

Comprehensive error handling with Zig's error types:

```zig
const result = client.getProgram("invalid-id") catch |err| switch (err) {
    openadr3.Error.InvalidProgramId => {
        std.debug.print("Invalid program ID format\\n", .{});
        return;
    },
    openadr3.Error.NetworkError => {
        std.debug.print("Network connection failed\\n", .{});
        return;
    },
    openadr3.Error.AuthenticationFailed => {
        std.debug.print("OAuth2 authentication failed\\n", .{});
        return;
    },
    openadr3.Error.ApiError => {
        std.debug.print("API returned an error\\n", .{});
        return;
    },
    else => return err,  // Propagate other errors
};
```

## Building

```bash
# Build the library
zig build

# Run tests
zig build test

# Build and run examples
zig build run-basic         # Basic usage example
zig build run-programs      # Programs API demonstration

# Build with release optimization
zig build -Doptimize=ReleaseFast

# Cross-compile (example for ARM64)
zig build -Dtarget=aarch64-linux
```

## Examples

The repository includes comprehensive examples:

### Basic Usage (`examples/basic_usage.zig`)
Demonstrates:
- Client initialization and configuration
- Program searching and creation
- Error handling patterns
- Memory management

### Programs API (`examples/programs_api.zig`)  
Demonstrates:
- Complete Programs API usage
- Event creation and management
- CRUD operations
- Advanced error handling

Run examples:
```bash
zig build run-basic
zig build run-programs
```

## Testing

```bash
# Run all tests
zig build test

# Run with verbose output
zig build test --summary all

# Test specific modules
zig test src/config.zig
zig test src/validation.zig
zig test src/types.zig
```

## Current Implementation Status

This version includes:

✅ **Complete API Structure**: All OpenADR 3.1.0 endpoints implemented  
✅ **OAuth2 Token Management**: Automatic token caching and renewal with thread safety  
✅ **Input/Output Validation**: Using OpenADR 3 type definitions with compile-time checks  
✅ **Memory Safety**: Zig's compile-time memory safety guarantees  
✅ **Error Handling**: Comprehensive error types with Zig's error handling system  
✅ **Mock Implementation**: Ready for testing without real VTN server  
✅ **Thread Safety**: Mutex-protected token caching  

🚧 **HTTP Implementation**: Currently uses mock responses (easily upgradeable to real HTTP)  
🚧 **OpenADR 3 Types Integration**: Uses demo types (can be upgraded to full OpenADR types)  

## Future Enhancements

- Real HTTP client implementation (when HTTP library stabilizes in Zig)
- Integration with full OpenADR 3 types from `openadr-3-ts-types` 
- WebSocket support for real-time notifications
- Additional authentication methods
- Request/response logging and metrics
- Async/await patterns with Zig's async support

## Performance

Zig provides:
- **Zero-overhead abstractions**: No runtime cost for safety features
- **Compile-time optimizations**: Dead code elimination and inlining
- **Small binary size**: Minimal runtime overhead
- **Fast compilation**: Quick development iteration
- **Cross-platform**: Single codebase for all targets

## Contributing

This client follows the same patterns as the other OpenADR 3 client implementations in this repository. When making changes, ensure consistency across all platform implementations:

- Follow Zig naming conventions (snake_case for variables, PascalCase for types)
- Use explicit error handling with Zig's error system
- Maintain memory safety with proper cleanup patterns
- Include comprehensive tests for new functionality
- Update documentation for API changes

## License

Apache 2.0 License - see LICENSE file for details.