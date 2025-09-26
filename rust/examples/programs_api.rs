//! Programs API usage example for OpenADR 3 Rust client

use openadr3_client::{OADR3, OADR3Config, DemoProgram, DemoProgramType, DemoTargetType, DemoEvent};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the client
    let config = OADR3Config::new(
        "https://your-vtn-server.com".to_string(),
        "your-client-id".to_string(),
        "your-client-secret".to_string(),
    )?
    .with_scope("read_targets write_programs")
    .with_timeout(60);

    let client = OADR3::new(config)?;

    // ============================================================================
    // Programs API Example
    // ============================================================================
    
    println!("=== Programs API Demo ===");

    // 1. Search all programs
    println!("\n1. Searching all programs...");
    let all_programs = client.search_all_programs(None, None, None).await?;
    println!("Status: {}", all_programs.status);
    if let Some(programs) = all_programs.response() {
        println!("Found {} programs", programs.len());
    }

    // 2. Search programs with filters
    println!("\n2. Searching commercial programs...");
    let filtered_programs = client.search_all_programs(
        Some(vec![DemoTargetType::Commercial]),
        Some(0),
        Some(10)
    ).await?;
    println!("Status: {}", filtered_programs.status);

    // 3. Create a new program
    println!("\n3. Creating a new program...");
    let new_program = DemoProgram {
        id: "rust-demo-program".to_string(),
        program_name: "Rust SDK Demo Program".to_string(),
        retailer_name: "Demo Utility Co.".to_string(),
        country: "US".to_string(),
        principal_subdivision: Some("CA".to_string()),
        program_type: DemoProgramType::TimeOfUse,
        targets: vec![DemoTargetType::Residential, DemoTargetType::Commercial],
    };

    let created_program = client.create_program(new_program.clone()).await?;
    println!("Create status: {}", created_program.status);
    if created_program.is_success() {
        println!("✅ Program created successfully");
    }

    // 4. Get the created program
    println!("\n4. Retrieving the created program...");
    let retrieved = client.get_program("rust-demo-program").await?;
    println!("Get status: {}", retrieved.status);
    if let Some(program) = retrieved.response() {
        println!("Retrieved program: {}", program.program_name);
    }

    // 5. Update the program
    println!("\n5. Updating the program...");
    let mut updated_program = new_program.clone();
    updated_program.program_name = "Updated Rust SDK Demo Program".to_string();
    updated_program.targets.push(DemoTargetType::Industrial);

    let update_result = client.update_program("rust-demo-program", updated_program).await?;
    println!("Update status: {}", update_result.status);

    // ============================================================================
    // Events API Example  
    // ============================================================================

    println!("\n=== Events API Demo ===");

    // 1. Search events for the program
    println!("\n1. Searching events for program...");
    let events = client.search_events("rust-demo-program", None, Some(5)).await?;
    println!("Events search status: {}", events.status);

    // 2. Create a new event
    println!("\n2. Creating a new event...");
    let new_event = DemoEvent {
        id: "rust-demo-event".to_string(),
        program_id: "rust-demo-program".to_string(),
        event_name: "Peak Hour Reduction Event".to_string(),
        event_type: "demand_response".to_string(),
        start_time: chrono::Utc::now() + chrono::Duration::try_hours(2).unwrap(),
        end_time: chrono::Utc::now() + chrono::Duration::try_hours(4).unwrap(),
    };

    let created_event = client.create_event("rust-demo-program", new_event).await?;
    println!("Create event status: {}", created_event.status);

    // 3. Get the created event
    println!("\n3. Retrieving the created event...");
    let retrieved_event = client.get_event("rust-demo-program", "rust-demo-event").await?;
    println!("Get event status: {}", retrieved_event.status);

    // ============================================================================
    // Cleanup (optional)
    // ============================================================================

    println!("\n=== Cleanup ===");

    // Delete the event
    println!("\n1. Deleting the event...");
    let delete_event_result = client.delete_event("rust-demo-program", "rust-demo-event").await?;
    println!("Delete event status: {}", delete_event_result.status);

    // Delete the program
    println!("\n2. Deleting the program...");
    let delete_program_result = client.delete_program("rust-demo-program").await?;
    println!("Delete program status: {}", delete_program_result.status);

    println!("\n🎉 Programs API demo completed!");
    Ok(())
}