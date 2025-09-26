//! Configuration for OpenADR 3 client

const std = @import("std");
const errors = @import("errors.zig");

/// Configuration for OpenADR 3 client
pub const OADR3Config = struct {
    /// VTN server base URL
    base_url: []const u8,
    /// OAuth2 client ID
    client_id: []const u8,
    /// OAuth2 client secret
    client_secret: []const u8,
    /// Optional OAuth2 scope
    scope: ?[]const u8 = null,
    /// Request timeout in seconds
    timeout_seconds: u32 = 30,

    const Self = @This();

    /// Create a new configuration with validation
    pub fn init(
        base_url: []const u8,
        client_id: []const u8,
        client_secret: []const u8,
    ) errors.Error!Self {
        // Validate inputs
        if (base_url.len == 0) {
            return errors.Error.EmptyBaseUrl;
        }

        if (client_id.len == 0) {
            return errors.Error.EmptyClientId;
        }

        if (client_secret.len == 0) {
            return errors.Error.EmptyClientSecret;
        }

        // Remove trailing slash from base_url
        const normalized_url = if (std.mem.endsWith(u8, base_url, "/"))
            base_url[0 .. base_url.len - 1]
        else
            base_url;

        return Self{
            .base_url = normalized_url,
            .client_id = client_id,
            .client_secret = client_secret,
        };
    }

    /// Set OAuth2 scope
    pub fn withScope(self: Self, scope: []const u8) Self {
        var config = self;
        config.scope = scope;
        return config;
    }

    /// Set request timeout
    pub fn withTimeout(self: Self, timeout_seconds: u32) Self {
        var config = self;
        config.timeout_seconds = timeout_seconds;
        return config;
    }

    /// Get the OAuth2 token endpoint URL
    pub fn getTokenUrl(self: Self, allocator: std.mem.Allocator) ![]const u8 {
        return try std.fmt.allocPrint(allocator, "{s}/auth/token", .{self.base_url});
    }

    /// Get full API URL for a given path
    pub fn getApiUrl(self: Self, allocator: std.mem.Allocator, path: []const u8) ![]const u8 {
        const normalized_path = if (std.mem.startsWith(u8, path, "/"))
            path
        else
            try std.fmt.allocPrint(allocator, "/{s}", .{path});

        defer {
            if (!std.mem.startsWith(u8, path, "/")) {
                allocator.free(normalized_path);
            }
        }

        return try std.fmt.allocPrint(allocator, "{s}{s}", .{ self.base_url, normalized_path });
    }

    /// Validate the configuration
    pub fn validate(self: Self) errors.Error!void {
        if (self.base_url.len == 0) {
            return errors.Error.EmptyBaseUrl;
        }

        if (self.client_id.len == 0) {
            return errors.Error.EmptyClientId;
        }

        if (self.client_secret.len == 0) {
            return errors.Error.EmptyClientSecret;
        }

        if (self.timeout_seconds == 0) {
            return errors.Error.InvalidConfiguration;
        }
    }
};

test "OADR3Config creation and validation" {
    const config = try OADR3Config.init(
        "https://example.com",
        "test_client",
        "test_secret",
    );

    try std.testing.expectEqualStrings("https://example.com", config.base_url);
    try std.testing.expectEqualStrings("test_client", config.client_id);
    try std.testing.expectEqualStrings("test_secret", config.client_secret);
    try std.testing.expect(config.scope == null);
    try std.testing.expectEqual(@as(u32, 30), config.timeout_seconds);

    try config.validate();
}

test "OADR3Config with trailing slash" {
    const config = try OADR3Config.init(
        "https://example.com/",
        "test_client",
        "test_secret",
    );

    try std.testing.expectEqualStrings("https://example.com", config.base_url);
}

test "OADR3Config with scope and timeout" {
    const config = try OADR3Config.init(
        "https://example.com",
        "test_client",
        "test_secret",
    );

    const config_with_scope = config.withScope("read_targets write_programs");
    const config_with_timeout = config_with_scope.withTimeout(60);

    try std.testing.expectEqualStrings("read_targets write_programs", config_with_timeout.scope.?);
    try std.testing.expectEqual(@as(u32, 60), config_with_timeout.timeout_seconds);
}

test "OADR3Config URL generation" {
    const config = try OADR3Config.init(
        "https://example.com",
        "test_client",
        "test_secret",
    );

    const token_url = try config.getTokenUrl(std.testing.allocator);
    defer std.testing.allocator.free(token_url);
    try std.testing.expectEqualStrings("https://example.com/auth/token", token_url);

    const api_url = try config.getApiUrl(std.testing.allocator, "/programs");
    defer std.testing.allocator.free(api_url);
    try std.testing.expectEqualStrings("https://example.com/programs", api_url);

    const api_url_no_slash = try config.getApiUrl(std.testing.allocator, "events");
    defer std.testing.allocator.free(api_url_no_slash);
    try std.testing.expectEqualStrings("https://example.com/events", api_url_no_slash);
}

test "OADR3Config validation errors" {
    try std.testing.expectError(errors.Error.EmptyBaseUrl, OADR3Config.init("", "client", "secret"));
    try std.testing.expectError(errors.Error.EmptyClientId, OADR3Config.init("https://example.com", "", "secret"));
    try std.testing.expectError(errors.Error.EmptyClientSecret, OADR3Config.init("https://example.com", "client", ""));
}
