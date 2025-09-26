const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Create the OpenADR 3 client module
    const mod = b.addModule("openadr3", .{
        .root_source_file = b.path("src/lib.zig"),
        .target = target,
    });

    // Create examples
    const basic_example = b.addExecutable(.{
        .name = "basic_usage",
        .root_module = b.createModule(.{
            .root_source_file = b.path("examples/basic_usage.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "openadr3", .module = mod },
            },
        }),
    });
    b.installArtifact(basic_example);

    // Run step for basic example
    const run_basic_step = b.step("run-basic", "Run basic usage example");
    const run_basic_cmd = b.addRunArtifact(basic_example);
    run_basic_cmd.step.dependOn(b.getInstallStep());
    run_basic_step.dependOn(&run_basic_cmd.step);

    // Programs API example
    const programs_example = b.addExecutable(.{
        .name = "programs_api",
        .root_module = b.createModule(.{
            .root_source_file = b.path("examples/programs_api.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "openadr3", .module = mod },
            },
        }),
    });
    b.installArtifact(programs_example);

    // Run step for programs example
    const run_programs_step = b.step("run-programs", "Run programs API example");
    const run_programs_cmd = b.addRunArtifact(programs_example);
    run_programs_cmd.step.dependOn(b.getInstallStep());
    run_programs_step.dependOn(&run_programs_cmd.step);

    // Module tests
    const mod_tests = b.addTest(.{
        .root_module = mod,
    });
    const run_mod_tests = b.addRunArtifact(mod_tests);

    // Test step
    const test_step = b.step("test", "Run tests");
    test_step.dependOn(&run_mod_tests.step);
}
