//! Basic usage example for OpenADR 3 Rust client

use openadr3_client::{OADR3, OADR3Config, DemoProgram, DemoProgramType, DemoTargetType};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the client with configuration
    let config = OADR3Config::new(
        "https://your-vtn-server.com".to_string(),
        "your-client-id".to_string(),
        "your-client-secret".to_string(),
    )?;

    let client = OADR3::new(config)?;

    // Search for programs
    println!("Searching for programs...");
    let programs = client.search_all_programs(None, None, None).await?;
    
    if programs.is_success() {
        if let Some(program_list) = programs.response() {
            println!("Found {} programs", program_list.len());
            for program in program_list {
                println!("  - {} ({})", program.program_name, program.id);
            }
        }
    } else {
        println!("Error searching programs: {:?}", programs.problem());
    }

    // Create a new program
    println!("\nCreating a new program...");
    let new_program = DemoProgram {
        id: "demo-program-123".to_string(),
        program_name: "Peak Hour Demand Response".to_string(),
        retailer_name: "Example Utility Company".to_string(),
        country: "US".to_string(),
        principal_subdivision: Some("CA".to_string()),
        program_type: DemoProgramType::DemandResponse,
        targets: vec![DemoTargetType::Commercial, DemoTargetType::Industrial],
    };

    let created = client.create_program(new_program).await?;
    if created.is_success() {
        println!("Program created successfully!");
        if let Some(program) = created.response() {
            println!("  ID: {}", program.id);
            println!("  Name: {}", program.program_name);
        }
    } else {
        println!("Error creating program: {:?}", created.problem());
    }

    // Get a specific program
    println!("\nFetching program details...");
    let program_detail = client.get_program("demo-program-123").await?;
    if program_detail.is_success() {
        println!("Program details retrieved successfully!");
    }

    // Search events for the program
    println!("\nSearching for events...");
    let events = client.search_events("demo-program-123", None, Some(10)).await?;
    if events.is_success() {
        if let Some(event_list) = events.response() {
            println!("Found {} events", event_list.len());
        }
    }

    // Search VENs
    println!("\nSearching for VENs...");
    let vens = client.search_vens(None, Some(5)).await?;
    if vens.is_success() {
        if let Some(ven_list) = vens.response() {
            println!("Found {} VENs", ven_list.len());
        }
    }

    println!("\nDemo completed successfully!");
    Ok(())
}