//! Data types for OpenADR 3 client

const std = @import("std");
const errors = @import("errors.zig");

/// Generic API response wrapper
pub fn APIResponse(comptime T: type) type {
    return struct {
        /// HTTP status code
        status: u16,
        /// Response data if successful
        response: ?T = null,
        /// Error information if failed
        problem: ?errors.APIError = null,

        const Self = @This();

        /// Create a successful response
        pub fn success(status: u16, data: T) Self {
            return Self{
                .status = status,
                .response = data,
                .problem = null,
            };
        }

        /// Create an error response
        pub fn failure(status: u16, api_error: errors.APIError) Self {
            return Self{
                .status = status,
                .response = null,
                .problem = api_error,
            };
        }

        /// Check if response was successful
        pub fn isSuccess(self: Self) bool {
            return self.status >= 200 and self.status < 300 and self.problem == null;
        }

        /// Check if response was an error
        pub fn isError(self: Self) bool {
            return !self.isSuccess();
        }

        /// Get response data, or null if error
        pub fn getData(self: Self) ?T {
            return self.response;
        }

        /// Get error information, or null if successful
        pub fn getError(self: Self) ?errors.APIError {
            return self.problem;
        }

        /// Convert to Result type
        pub fn toResult(self: Self) errors.Error!T {
            if (self.isSuccess()) {
                if (self.response) |data| {
                    return data;
                }
            }
            return errors.Error.ApiError;
        }

        /// Clean up any allocated memory (if T requires it)
        pub fn deinit(self: Self, allocator: std.mem.Allocator) void {
            _ = allocator; // May be used below

            // Handle cleanup based on the specific type
            // Note: This is a simplified cleanup - in production code you'd want
            // more sophisticated memory management
            if (self.response) |response| {
                _ = response; // Response cleanup is handled by caller
            }
        }
    };
}

/// OAuth2 token information
pub const OAuth2Token = struct {
    /// Access token string
    access_token: []const u8,
    /// Token type (usually "Bearer")
    token_type: []const u8,
    /// Token expiration time in seconds
    expires_in: u64,
    /// Optional scope
    scope: ?[]const u8 = null,
    /// Token creation timestamp
    created_at: i64,

    const Self = @This();

    /// Create a new OAuth2 token
    pub fn init(
        access_token: []const u8,
        token_type: []const u8,
        expires_in: u64,
        scope: ?[]const u8,
    ) Self {
        return Self{
            .access_token = access_token,
            .token_type = token_type,
            .expires_in = expires_in,
            .scope = scope,
            .created_at = std.time.timestamp(),
        };
    }

    /// Check if the token is expired (with optional buffer)
    pub fn isExpired(self: Self, buffer_seconds: u64) bool {
        const now = std.time.timestamp();
        const expiry_time = self.created_at + @as(i64, @intCast(self.expires_in));
        const buffer_time = expiry_time - @as(i64, @intCast(buffer_seconds));
        return now >= buffer_time;
    }

    /// Get remaining time until expiration in seconds
    pub fn remainingTime(self: Self) i64 {
        const now = std.time.timestamp();
        const expiry_time = self.created_at + @as(i64, @intCast(self.expires_in));
        return @max(0, expiry_time - now);
    }
};

// ============================================================================
// Demo Types (similar to other implementations)
// ============================================================================

/// Program type enumeration
pub const DemoProgramType = enum {
    demand_response,
    time_of_use,
    real_time_pricing,

    /// Convert to string representation
    pub fn toString(self: DemoProgramType) []const u8 {
        return switch (self) {
            .demand_response => "demand_response",
            .time_of_use => "time_of_use",
            .real_time_pricing => "real_time_pricing",
        };
    }

    /// Parse from string
    pub fn fromString(str: []const u8) ?DemoProgramType {
        if (std.mem.eql(u8, str, "demand_response")) return .demand_response;
        if (std.mem.eql(u8, str, "time_of_use")) return .time_of_use;
        if (std.mem.eql(u8, str, "real_time_pricing")) return .real_time_pricing;
        return null;
    }
};

/// Target type enumeration
pub const DemoTargetType = enum {
    residential,
    commercial,
    industrial,

    /// Convert to string representation
    pub fn toString(self: DemoTargetType) []const u8 {
        return switch (self) {
            .residential => "residential",
            .commercial => "commercial",
            .industrial => "industrial",
        };
    }

    /// Parse from string
    pub fn fromString(str: []const u8) ?DemoTargetType {
        if (std.mem.eql(u8, str, "residential")) return .residential;
        if (std.mem.eql(u8, str, "commercial")) return .commercial;
        if (std.mem.eql(u8, str, "industrial")) return .industrial;
        return null;
    }
};

/// Demo program structure
pub const DemoProgram = struct {
    /// Program identifier
    id: []const u8,
    /// Program name
    program_name: []const u8,
    /// Retailer name
    retailer_name: []const u8,
    /// Country code
    country: []const u8,
    /// State/province (optional)
    principal_subdivision: ?[]const u8 = null,
    /// Program type
    program_type: DemoProgramType,
    /// Target customer types
    targets: []const DemoTargetType,

    const Self = @This();

    /// Create a new demo program
    pub fn init(
        allocator: std.mem.Allocator,
        id: []const u8,
        program_name: []const u8,
        retailer_name: []const u8,
        country: []const u8,
        principal_subdivision: ?[]const u8,
        program_type: DemoProgramType,
        targets: []const DemoTargetType,
    ) !Self {
        // Clone strings to ensure ownership
        const owned_id = try allocator.dupe(u8, id);
        const owned_program_name = try allocator.dupe(u8, program_name);
        const owned_retailer_name = try allocator.dupe(u8, retailer_name);
        const owned_country = try allocator.dupe(u8, country);
        const owned_subdivision = if (principal_subdivision) |ps|
            try allocator.dupe(u8, ps)
        else
            null;
        const owned_targets = try allocator.dupe(DemoTargetType, targets);

        return Self{
            .id = owned_id,
            .program_name = owned_program_name,
            .retailer_name = owned_retailer_name,
            .country = owned_country,
            .principal_subdivision = owned_subdivision,
            .program_type = program_type,
            .targets = owned_targets,
        };
    }

    /// Clean up allocated memory
    pub fn deinit(self: Self, allocator: std.mem.Allocator) void {
        allocator.free(self.id);
        allocator.free(self.program_name);
        allocator.free(self.retailer_name);
        allocator.free(self.country);
        if (self.principal_subdivision) |ps| {
            allocator.free(ps);
        }
        allocator.free(self.targets);
    }
};

/// Demo event structure
pub const DemoEvent = struct {
    /// Event identifier
    id: []const u8,
    /// Associated program ID
    program_id: []const u8,
    /// Event name
    event_name: []const u8,
    /// Event type
    event_type: []const u8,
    /// Event start time (Unix timestamp)
    start_time: i64,
    /// Event end time (Unix timestamp)
    end_time: i64,

    const Self = @This();

    /// Create a new demo event
    pub fn init(
        allocator: std.mem.Allocator,
        id: []const u8,
        program_id: []const u8,
        event_name: []const u8,
        event_type: []const u8,
        start_time: i64,
        end_time: i64,
    ) !Self {
        // Clone strings to ensure ownership
        const owned_id = try allocator.dupe(u8, id);
        const owned_program_id = try allocator.dupe(u8, program_id);
        const owned_event_name = try allocator.dupe(u8, event_name);
        const owned_event_type = try allocator.dupe(u8, event_type);

        return Self{
            .id = owned_id,
            .program_id = owned_program_id,
            .event_name = owned_event_name,
            .event_type = owned_event_type,
            .start_time = start_time,
            .end_time = end_time,
        };
    }

    /// Clean up allocated memory
    pub fn deinit(self: Self, allocator: std.mem.Allocator) void {
        allocator.free(self.id);
        allocator.free(self.program_id);
        allocator.free(self.event_name);
        allocator.free(self.event_type);
    }

    /// Check if event is currently active
    pub fn isActive(self: Self) bool {
        const now = std.time.timestamp();
        return now >= self.start_time and now <= self.end_time;
    }

    /// Get event duration in seconds
    pub fn getDuration(self: Self) i64 {
        return self.end_time - self.start_time;
    }
};

test "APIResponse success" {
    const ResponseType = APIResponse([]const u8);
    const response = ResponseType.success(200, "test data");

    try std.testing.expect(response.isSuccess());
    try std.testing.expect(!response.isError());
    try std.testing.expectEqual(@as(u16, 200), response.status);
    try std.testing.expectEqualStrings("test data", response.getData().?);
}

test "APIResponse failure" {
    const ResponseType = APIResponse([]const u8);
    const api_error = errors.APIError{ .status = 404, .detail = "Not found" };
    const response = ResponseType.failure(404, api_error);

    try std.testing.expect(!response.isSuccess());
    try std.testing.expect(response.isError());
    try std.testing.expectEqual(@as(u16, 404), response.status);
    try std.testing.expect(response.getError() != null);
}

test "OAuth2Token expiration" {
    const token = OAuth2Token.init("access_token", "Bearer", 3600, null);

    try std.testing.expect(!token.isExpired(0));
    try std.testing.expect(!token.isExpired(3600));
    try std.testing.expect(token.remainingTime() > 0);
}
