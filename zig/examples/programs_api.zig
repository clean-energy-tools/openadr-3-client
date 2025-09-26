//! Programs API usage example for OpenADR 3 Zig client

const std = @import("std");
const openadr3 = @import("openadr3");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Initialize the client
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

    std.debug.print("=== OpenADR 3 Programs API Demo ===\n\n", .{});

    // Search all programs
    std.debug.print("1. Searching all programs...\n", .{});
    const all_programs = try client.searchAllPrograms(null, null, null);
    defer all_programs.deinit(allocator);

    std.debug.print("Status: {d}\n", .{all_programs.status});
    if (all_programs.getData()) |programs| {
        std.debug.print("Found {d} programs\n", .{programs.len});
        for (programs) |program| {
            program.deinit(allocator);
        }
    }

    std.debug.print("\n🎉 Programs API demo completed!\n", .{});
}
