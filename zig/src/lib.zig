//! OpenADR 3 Zig Client Library
//!
//! This library provides a comprehensive Zig client for the OpenADR 3.1.0 protocol,
//! featuring OAuth2 authentication and complete API coverage.
//!
//! ## Features
//!
//! - **OAuth2 Authentication**: Automatic token management using Client Credentials flow
//! - **Complete API Coverage**: All OpenADR 3.1.0 operations implemented
//! - **Input/Output Validation**: Request and response validation using OpenADR 3 types
//! - **Memory Safety**: Leverages Zig's compile-time memory safety guarantees
//! - **Async Support**: Built for async HTTP operations
//!
//! ## Quick Start
//!
//! ```zig
//! const openadr3 = @import("openadr3");
//! const std = @import("std");
//!
//! pub fn main() !void {
//!     var gpa = std.heap.GeneralPurposeAllocator(.{}){};
//!     defer _ = gpa.deinit();
//!     const allocator = gpa.allocator();
//!
//!     const config = try openadr3.OADR3Config.init(
//!         "https://your-vtn-server.com",
//!         "your-client-id",
//!         "your-client-secret",
//!     );
//!
//!     var client = try openadr3.OADR3.init(allocator, config);
//!     defer client.deinit();
//!
//!     const programs = try client.searchAllPrograms(null, null, null);
//!     defer programs.deinit(allocator);
//!
//!     if (programs.isSuccess()) {
//!         std.log.info("Found {} programs", .{programs.getData().?.len});
//!     }
//! }
//! ```

const std = @import("std");

// Core modules
pub const config = @import("config.zig");
pub const client = @import("client.zig");
pub const types = @import("types.zig");
pub const validation = @import("validation.zig");
pub const errors = @import("errors.zig");

// Re-export main types for convenient access
pub const OADR3 = client.OADR3;
pub const OADR3Config = config.OADR3Config;
pub const APIResponse = types.APIResponse;
pub const Error = errors.Error;

// Re-export demo types
pub const DemoProgram = types.DemoProgram;
pub const DemoEvent = types.DemoEvent;
pub const DemoProgramType = types.DemoProgramType;
pub const DemoTargetType = types.DemoTargetType;
pub const OAuth2Token = types.OAuth2Token;

// Export validation functions
pub const validateProgram = validation.validateProgram;
pub const validateEvent = validation.validateEvent;
pub const validateSearchParams = validation.validateSearchParams;

test "library imports" {
    // Test that all modules can be imported successfully
    _ = config;
    _ = client;
    _ = types;
    _ = validation;
    _ = errors;
}
