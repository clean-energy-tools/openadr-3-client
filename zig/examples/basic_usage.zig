//! Basic usage example for OpenADR 3 Zig client

const std = @import("std");
const openadr3 = @import("openadr3");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Initialize the client with configuration
    const config = try openadr3.OADR3Config.init(
        "https://your-vtn-server.com",
        "your-client-id",
        "your-client-secret",
    );

    const client_config = config
        .withScope("read_targets write_programs")
        .withTimeout(30);

    var client = try openadr3.OADR3.init(allocator, client_config);
    defer client.deinit();

    std.debug.print("=== OpenADR 3 Zig Client Demo ===\n\n", .{});

    // Search for programs
    std.debug.print("1. Searching for programs...\n", .{});
    const programs = client.searchAllPrograms(null, null, null) catch |err| {
        std.debug.print("Error searching programs: {any}\n", .{err});
        return;
    };
    defer programs.deinit(allocator);

    if (programs.isSuccess()) {
        if (programs.getData()) |program_list| {
            std.debug.print("✅ Found {d} programs\n", .{program_list.len});
            for (program_list, 0..) |program, i| {
                std.debug.print("  {d}. {s} ({s})\n", .{ i + 1, program.program_name, program.id });
                std.debug.print("     Retailer: {s}\n", .{program.retailer_name});
                std.debug.print("     Type: {s}\n", .{program.program_type.toString()});

                // Clean up program data
                program.deinit(allocator);
            }
        }
    } else {
        std.debug.print("❌ Error searching programs\n", .{});
    }

    std.debug.print("\n🎉 Demo completed successfully!\n", .{});
}
