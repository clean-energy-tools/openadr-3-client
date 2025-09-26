//! Validation functions for OpenADR 3 data

const std = @import("std");
const types = @import("types.zig");
const errors = @import("errors.zig");

/// Validate search parameters (skip and limit)
pub fn validateSearchParams(skip: ?i32, limit: ?i32) errors.Error!void {
    if (skip) |s| {
        if (s < 0) {
            return errors.Error.InvalidSearchParams;
        }
    }

    if (limit) |l| {
        if (l < 0 or l > 50) {
            return errors.Error.InvalidSearchParams;
        }
    }
}

/// Validate program ID
pub fn validateProgramId(program_id: []const u8) errors.Error!void {
    if (program_id.len == 0) {
        return errors.Error.InvalidProgramId;
    }
}

/// Validate a program structure
pub fn validateProgram(program: types.DemoProgram) errors.Error!void {
    if (program.id.len == 0) {
        return errors.Error.InvalidProgramData;
    }

    if (program.program_name.len == 0) {
        return errors.Error.InvalidProgramData;
    }

    if (program.retailer_name.len == 0) {
        return errors.Error.InvalidProgramData;
    }

    if (program.country.len == 0) {
        return errors.Error.InvalidProgramData;
    }

    if (program.targets.len == 0) {
        return errors.Error.InvalidProgramData;
    }
}

/// Validate an event structure
pub fn validateEvent(event: types.DemoEvent) errors.Error!void {
    if (event.id.len == 0) {
        return errors.Error.InvalidEventData;
    }

    if (event.program_id.len == 0) {
        return errors.Error.InvalidEventData;
    }

    if (event.event_name.len == 0) {
        return errors.Error.InvalidEventData;
    }

    if (event.event_type.len == 0) {
        return errors.Error.InvalidEventData;
    }

    if (event.start_time >= event.end_time) {
        return errors.Error.InvalidEventData;
    }
}

/// Validate a list of programs
pub fn validatePrograms(programs: []const types.DemoProgram) errors.Error!void {
    for (programs) |program| {
        try validateProgram(program);
    }
}

/// Validate a list of events
pub fn validateEvents(events: []const types.DemoEvent) errors.Error!void {
    for (events) |event| {
        try validateEvent(event);
    }
}

/// Validation trait for types that can be validated
pub fn Validator(comptime T: type) type {
    return struct {
        pub fn validate(item: T) errors.Error!void {
            switch (T) {
                types.DemoProgram => return validateProgram(item),
                types.DemoEvent => return validateEvent(item),
                else => @compileError("Unsupported type for validation: " ++ @typeName(T)),
            }
        }
    };
}

// Helper functions for validating collections

/// Validate array of items that implement validation
pub fn validateArray(comptime T: type, items: []const T) errors.Error!void {
    const validator = Validator(T);
    for (items) |item| {
        try validator.validate(item);
    }
}

/// Check if a string represents a valid UUID (basic check)
pub fn isValidUuid(str: []const u8) bool {
    // Basic UUID format: 8-4-4-4-12 characters
    if (str.len != 36) return false;

    const dash_positions = [_]usize{ 8, 13, 18, 23 };
    for (dash_positions) |pos| {
        if (str[pos] != '-') return false;
    }

    // Check hex characters (simplified)
    for (str, 0..) |char, i| {
        const is_dash_position = for (dash_positions) |pos| {
            if (i == pos) break true;
        } else false;

        if (!is_dash_position) {
            const is_hex = (char >= '0' and char <= '9') or
                (char >= 'a' and char <= 'f') or
                (char >= 'A' and char <= 'F');
            if (!is_hex) return false;
        }
    }

    return true;
}

/// Check if a string represents a valid ISO country code (2 letters)
pub fn isValidCountryCode(country: []const u8) bool {
    if (country.len != 2) return false;

    for (country) |char| {
        if (char < 'A' or char > 'Z') return false;
    }

    return true;
}

test "validate search params" {
    try validateSearchParams(null, null);
    try validateSearchParams(0, 10);
    try validateSearchParams(5, null);

    try std.testing.expectError(errors.Error.InvalidSearchParams, validateSearchParams(-1, null));
    try std.testing.expectError(errors.Error.InvalidSearchParams, validateSearchParams(null, -1));
    try std.testing.expectError(errors.Error.InvalidSearchParams, validateSearchParams(null, 100));
}

test "validate program ID" {
    try validateProgramId("valid-program-id");
    try std.testing.expectError(errors.Error.InvalidProgramId, validateProgramId(""));
}

test "validate program" {
    const allocator = std.testing.allocator;

    const valid_program = try types.DemoProgram.init(
        allocator,
        "program-123",
        "Test Program",
        "Test Utility",
        "US",
        "CA",
        .demand_response,
        &[_]types.DemoTargetType{.commercial},
    );
    defer valid_program.deinit(allocator);

    try validateProgram(valid_program);

    // Test invalid program (empty ID)
    const invalid_program = try types.DemoProgram.init(
        allocator,
        "", // Empty ID
        "Test Program",
        "Test Utility",
        "US",
        null,
        .demand_response,
        &[_]types.DemoTargetType{.residential},
    );
    defer invalid_program.deinit(allocator);

    try std.testing.expectError(errors.Error.InvalidProgramData, validateProgram(invalid_program));
}

test "validate event" {
    const allocator = std.testing.allocator;
    const now = std.time.timestamp();

    const valid_event = try types.DemoEvent.init(
        allocator,
        "event-123",
        "program-123",
        "Test Event",
        "demand_response",
        now + 3600, // Start in 1 hour
        now + 7200, // End in 2 hours
    );
    defer valid_event.deinit(allocator);

    try validateEvent(valid_event);

    // Test invalid event (end before start)
    const invalid_event = try types.DemoEvent.init(
        allocator,
        "event-456",
        "program-123",
        "Invalid Event",
        "demand_response",
        now + 7200, // Start in 2 hours
        now + 3600, // End in 1 hour (invalid)
    );
    defer invalid_event.deinit(allocator);

    try std.testing.expectError(errors.Error.InvalidEventData, validateEvent(invalid_event));
}

test "UUID validation" {
    try std.testing.expect(isValidUuid("123e4567-e89b-12d3-a456-426614174000"));
    try std.testing.expect(!isValidUuid("invalid-uuid"));
    try std.testing.expect(!isValidUuid("123e4567-e89b-12d3-a456-42661417400")); // Too short
    try std.testing.expect(!isValidUuid("123e4567-e89b-12d3-a456-426614174000x")); // Too long
}

test "country code validation" {
    try std.testing.expect(isValidCountryCode("US"));
    try std.testing.expect(isValidCountryCode("CA"));
    try std.testing.expect(!isValidCountryCode("USA")); // Too long
    try std.testing.expect(!isValidCountryCode("U")); // Too short
    try std.testing.expect(!isValidCountryCode("us")); // Lowercase
    try std.testing.expect(!isValidCountryCode("U5")); // Contains number
}
