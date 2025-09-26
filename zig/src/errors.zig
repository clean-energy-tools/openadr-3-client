//! Error types for OpenADR 3 client

const std = @import("std");

/// Main error type for OpenADR 3 client operations
pub const Error = error{
    /// Configuration errors
    InvalidConfiguration,
    EmptyClientId,
    EmptyClientSecret,
    EmptyBaseUrl,

    /// Validation errors
    ValidationFailed,
    InvalidProgramId,
    InvalidSearchParams,
    InvalidEventData,
    InvalidProgramData,

    /// HTTP/Network errors
    NetworkError,
    TimeoutError,

    /// Authentication errors
    AuthenticationFailed,
    TokenExpired,
    InvalidToken,

    /// API errors
    ApiError,
    BadRequest,
    Unauthorized,
    Forbidden,
    NotFound,
    InternalServerError,

    /// JSON/Serialization errors
    JsonParseError,
    JsonStringifyError,

    /// Memory allocation errors
    OutOfMemory,

    /// Generic errors
    UnknownError,
};

/// API error response information
pub const APIError = struct {
    /// Error type identifier
    error_type: ?[]const u8 = null,
    /// Human-readable error title
    title: ?[]const u8 = null,
    /// HTTP status code
    status: ?i32 = null,
    /// Detailed error message
    detail: ?[]const u8 = null,

    const Self = @This();

    /// Create an API error from HTTP status and message
    pub fn fromStatus(allocator: std.mem.Allocator, status: i32, message: []const u8) Self {
        _ = allocator; // Will be used when we need to allocate strings
        return Self{
            .error_type = null,
            .title = null,
            .status = status,
            .detail = message,
        };
    }

    /// Format the error as a string
    pub fn format(
        self: Self,
        comptime fmt: []const u8,
        options: std.fmt.FormatOptions,
        writer: anytype,
    ) !void {
        _ = fmt;
        _ = options;

        if (self.title) |title| {
            try writer.print("{s}", .{title});
        } else if (self.error_type) |error_type| {
            try writer.print("{s}", .{error_type});
        } else {
            try writer.print("API Error");
        }

        if (self.status) |status| {
            try writer.print(" ({d})", .{status});
        }

        if (self.detail) |detail| {
            try writer.print(": {s}", .{detail});
        }
    }

    /// Check if this represents a client error (4xx)
    pub fn isClientError(self: Self) bool {
        if (self.status) |status| {
            return status >= 400 and status < 500;
        }
        return false;
    }

    /// Check if this represents a server error (5xx)
    pub fn isServerError(self: Self) bool {
        if (self.status) |status| {
            return status >= 500 and status < 600;
        }
        return false;
    }
};

/// Result type alias for convenience
pub fn Result(comptime T: type) type {
    return Error!T;
}

test "API error formatting" {
    const api_error = APIError{
        .error_type = "validation_error",
        .title = "Validation Failed",
        .status = 400,
        .detail = "Missing required field: program_name",
    };

    const formatted = try std.fmt.allocPrint(std.testing.allocator, "{}", .{api_error});
    defer std.testing.allocator.free(formatted);

    try std.testing.expect(std.mem.indexOf(u8, formatted, "Validation Failed") != null);
    try std.testing.expect(std.mem.indexOf(u8, formatted, "400") != null);
}
