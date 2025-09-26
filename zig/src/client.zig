//! Main OpenADR 3 client implementation

const std = @import("std");
const config = @import("config.zig");
const types = @import("types.zig");
const errors = @import("errors.zig");
const validation = @import("validation.zig");

/// Main OpenADR 3 client
pub const OADR3 = struct {
    /// Configuration
    config: config.OADR3Config,
    /// Memory allocator
    allocator: std.mem.Allocator,
    /// Cached OAuth2 token
    cached_token: ?CachedToken = null,
    /// Token cache mutex for thread safety
    token_mutex: std.Thread.Mutex = .{},

    const Self = @This();

    /// Cached OAuth2 token with timestamp
    const CachedToken = struct {
        token: types.OAuth2Token,
        created_at: i64,

        /// Check if token is expired with buffer
        fn isExpired(self: @This(), buffer_seconds: u64) bool {
            return self.token.isExpired(buffer_seconds);
        }
    };

    /// Initialize a new OADR3 client
    pub fn init(allocator: std.mem.Allocator, client_config: config.OADR3Config) errors.Error!Self {
        try client_config.validate();

        return Self{
            .config = client_config,
            .allocator = allocator,
        };
    }

    /// Clean up client resources
    pub fn deinit(self: *Self) void {
        self.token_mutex.lock();
        defer self.token_mutex.unlock();

        if (self.cached_token) |*cached| {
            // Clean up cached token strings if needed
            _ = cached; // Token strings are not owned by us in this mock implementation
        }
    }

    /// Get a valid OAuth2 access token
    fn getAccessToken(self: *Self) errors.Error![]const u8 {
        self.token_mutex.lock();
        defer self.token_mutex.unlock();

        // Check if we have a valid cached token
        if (self.cached_token) |cached| {
            if (!cached.isExpired(30)) { // 30 second buffer
                return cached.token.access_token;
            }
        }

        // Mock token fetching - in real implementation would make HTTP request
        const mock_token = types.OAuth2Token.init(
            "mock-access-token-12345",
            "Bearer",
            3600, // 1 hour
            self.config.scope,
        );

        self.cached_token = CachedToken{
            .token = mock_token,
            .created_at = std.time.timestamp(),
        };

        return mock_token.access_token;
    }

    /// Make a mock HTTP request (in real implementation would use HTTP client)
    fn makeRequest(
        self: *Self,
        comptime T: type,
        method: []const u8,
        path: []const u8,
        body: ?[]const u8,
    ) errors.Error!types.APIResponse(T) {
        _ = method;
        _ = path;
        _ = body;

        // Get access token (validates OAuth2 flow)
        const access_token = try self.getAccessToken();
        _ = access_token; // Used for authentication in real implementation

        // Mock successful response based on type
        return self.createMockResponse(T);
    }

    /// Create mock response data for testing
    fn createMockResponse(self: *Self, comptime T: type) errors.Error!types.APIResponse(T) {
        switch (T) {
            []types.DemoProgram => {
                // Mock program list
                const mock_program = try types.DemoProgram.init(
                    self.allocator,
                    "mock-program-1",
                    "Mock Demand Response Program",
                    "Demo Utility Company",
                    "US",
                    "CA",
                    .demand_response,
                    &[_]types.DemoTargetType{ .commercial, .industrial },
                );

                const programs = try self.allocator.alloc(types.DemoProgram, 1);
                programs[0] = mock_program;

                return types.APIResponse(T).success(200, programs);
            },

            types.DemoProgram => {
                // Mock single program
                const mock_program = try types.DemoProgram.init(
                    self.allocator,
                    "mock-program-single",
                    "Single Mock Program",
                    "Demo Utility Company",
                    "US",
                    "CA",
                    .time_of_use,
                    &[_]types.DemoTargetType{.residential},
                );

                return types.APIResponse(T).success(200, mock_program);
            },

            []types.DemoEvent => {
                // Mock event list
                const now = std.time.timestamp();
                const mock_event = try types.DemoEvent.init(
                    self.allocator,
                    "mock-event-1",
                    "mock-program-1",
                    "Peak Hour Reduction Event",
                    "demand_response",
                    now + 3600, // Start in 1 hour
                    now + 7200, // End in 2 hours
                );

                const events = try self.allocator.alloc(types.DemoEvent, 1);
                events[0] = mock_event;

                return types.APIResponse(T).success(200, events);
            },

            types.DemoEvent => {
                // Mock single event
                const now = std.time.timestamp();
                const mock_event = try types.DemoEvent.init(
                    self.allocator,
                    "mock-event-single",
                    "mock-program-1",
                    "Single Mock Event",
                    "demand_response",
                    now + 1800, // Start in 30 minutes
                    now + 5400, // End in 90 minutes
                );

                return types.APIResponse(T).success(200, mock_event);
            },

            void => {
                // For delete operations
                return types.APIResponse(T).success(204, {});
            },

            else => {
                // Generic JSON response for reports, VENs, etc.
                @compileError("Unsupported response type: " ++ @typeName(T));
            },
        }
    }

    // ============================================================================
    // Programs API
    // ============================================================================

    /// Search all programs
    pub fn searchAllPrograms(
        self: *Self,
        targets: ?[]const types.DemoTargetType,
        skip: ?i32,
        limit: ?i32,
    ) errors.Error!types.APIResponse([]types.DemoProgram) {
        try validation.validateSearchParams(skip, limit);

        // In real implementation, would build query parameters
        _ = targets; // Would be used to filter results

        return try self.makeRequest([]types.DemoProgram, "GET", "/programs", null);
    }

    /// Create a program
    pub fn createProgram(
        self: *Self,
        program: types.DemoProgram,
    ) errors.Error!types.APIResponse(types.DemoProgram) {
        try validation.validateProgram(program);

        // In real implementation, would serialize program to JSON
        return try self.makeRequest(types.DemoProgram, "POST", "/programs", null);
    }

    /// Get a program by ID
    pub fn getProgram(
        self: *Self,
        program_id: []const u8,
    ) errors.Error!types.APIResponse(types.DemoProgram) {
        try validation.validateProgramId(program_id);

        const path = try std.fmt.allocPrint(self.allocator, "/programs/{s}", .{program_id});
        defer self.allocator.free(path);

        return try self.makeRequest(types.DemoProgram, "GET", path, null);
    }

    /// Update a program
    pub fn updateProgram(
        self: *Self,
        program_id: []const u8,
        program: types.DemoProgram,
    ) errors.Error!types.APIResponse(types.DemoProgram) {
        try validation.validateProgramId(program_id);
        try validation.validateProgram(program);

        const path = try std.fmt.allocPrint(self.allocator, "/programs/{s}", .{program_id});
        defer self.allocator.free(path);

        return try self.makeRequest(types.DemoProgram, "PUT", path, null);
    }

    /// Delete a program
    pub fn deleteProgram(
        self: *Self,
        program_id: []const u8,
    ) errors.Error!types.APIResponse(void) {
        try validation.validateProgramId(program_id);

        const path = try std.fmt.allocPrint(self.allocator, "/programs/{s}", .{program_id});
        defer self.allocator.free(path);

        return try self.makeRequest(void, "DELETE", path, null);
    }

    // ============================================================================
    // Events API
    // ============================================================================

    /// Search events for a program
    pub fn searchEvents(
        self: *Self,
        program_id: []const u8,
        skip: ?i32,
        limit: ?i32,
    ) errors.Error!types.APIResponse([]types.DemoEvent) {
        try validation.validateProgramId(program_id);
        try validation.validateSearchParams(skip, limit);

        const path = try std.fmt.allocPrint(self.allocator, "/programs/{s}/events", .{program_id});
        defer self.allocator.free(path);

        return try self.makeRequest([]types.DemoEvent, "GET", path, null);
    }

    /// Create an event
    pub fn createEvent(
        self: *Self,
        program_id: []const u8,
        event: types.DemoEvent,
    ) errors.Error!types.APIResponse(types.DemoEvent) {
        try validation.validateProgramId(program_id);
        try validation.validateEvent(event);

        const path = try std.fmt.allocPrint(self.allocator, "/programs/{s}/events", .{program_id});
        defer self.allocator.free(path);

        return try self.makeRequest(types.DemoEvent, "POST", path, null);
    }

    /// Get an event by ID
    pub fn getEvent(
        self: *Self,
        program_id: []const u8,
        event_id: []const u8,
    ) errors.Error!types.APIResponse(types.DemoEvent) {
        try validation.validateProgramId(program_id);

        const path = try std.fmt.allocPrint(self.allocator, "/programs/{s}/events/{s}", .{ program_id, event_id });
        defer self.allocator.free(path);

        return try self.makeRequest(types.DemoEvent, "GET", path, null);
    }

    /// Update an event
    pub fn updateEvent(
        self: *Self,
        program_id: []const u8,
        event_id: []const u8,
        event: types.DemoEvent,
    ) errors.Error!types.APIResponse(types.DemoEvent) {
        try validation.validateProgramId(program_id);
        try validation.validateEvent(event);

        const path = try std.fmt.allocPrint(self.allocator, "/programs/{s}/events/{s}", .{ program_id, event_id });
        defer self.allocator.free(path);

        return try self.makeRequest(types.DemoEvent, "PUT", path, null);
    }

    /// Delete an event
    pub fn deleteEvent(
        self: *Self,
        program_id: []const u8,
        event_id: []const u8,
    ) errors.Error!types.APIResponse(void) {
        try validation.validateProgramId(program_id);

        const path = try std.fmt.allocPrint(self.allocator, "/programs/{s}/events/{s}", .{ program_id, event_id });
        defer self.allocator.free(path);

        return try self.makeRequest(void, "DELETE", path, null);
    }

    // ============================================================================
    // Reports API (placeholder - returns mock JSON data)
    // ============================================================================

    /// Search reports (mock implementation)
    pub fn searchReports(
        self: *Self,
        program_id: ?[]const u8,
        skip: ?i32,
        limit: ?i32,
    ) errors.Error!types.APIResponse([]const u8) {
        try validation.validateSearchParams(skip, limit);
        _ = program_id; // Would be used for filtering

        // Mock JSON response
        const mock_json = try self.allocator.dupe(u8,
            \\[{"id": "report-1", "type": "usage", "status": "completed"}]
        );

        return types.APIResponse([]const u8).success(200, mock_json);
    }

    // ============================================================================
    // VENs API (placeholder - returns mock JSON data)
    // ============================================================================

    /// Search VENs (mock implementation)
    pub fn searchVens(
        self: *Self,
        skip: ?i32,
        limit: ?i32,
    ) errors.Error!types.APIResponse([]const u8) {
        try validation.validateSearchParams(skip, limit);

        // Mock JSON response
        const mock_json = try self.allocator.dupe(u8,
            \\[{"id": "ven-1", "name": "Demo VEN", "status": "active"}]
        );

        return types.APIResponse([]const u8).success(200, mock_json);
    }
};

test "OADR3 client initialization" {
    const allocator = std.testing.allocator;

    const client_config = try config.OADR3Config.init(
        "https://example.com",
        "test_client",
        "test_secret",
    );

    var client = try OADR3.init(allocator, client_config);
    defer client.deinit();

    try std.testing.expectEqualStrings("https://example.com", client.config.base_url);
}

test "OADR3 client search programs" {
    const allocator = std.testing.allocator;

    const client_config = try config.OADR3Config.init(
        "https://example.com",
        "test_client",
        "test_secret",
    );

    var client = try OADR3.init(allocator, client_config);
    defer client.deinit();

    const result = try client.searchAllPrograms(null, null, null);
    defer result.deinit(allocator);

    try std.testing.expect(result.isSuccess());
    try std.testing.expectEqual(@as(u16, 200), result.status);

    if (result.getData()) |programs| {
        try std.testing.expect(programs.len > 0);
        try std.testing.expectEqualStrings("mock-program-1", programs[0].id);

        // Clean up the programs
        for (programs) |program| {
            program.deinit(allocator);
        }
    }
}
