package main

import (
	"context"
	"fmt"
	"log"

	oadr3client "github.com/openadr/openadr-3-client/golang"
)

func main() {
	// Create client configuration
	config := oadr3client.OADR3Config{
		BaseURL:      "https://your-vtn-server.com",
		ClientID:     "your-client-id",
		ClientSecret: "your-client-secret",
		Scope:        "read_targets", // optional
	}

	// Create client
	client := oadr3client.NewOADR3(config)

	// Create context
	ctx := context.Background()

	// Example 1: Search for programs
	fmt.Println("Searching for programs...")
	programs, err := client.SearchAllPrograms(ctx, nil, nil, nil)
	if err != nil {
		log.Printf("Error searching programs: %v", err)
	} else if programs.Problem != nil {
		fmt.Printf("API Error: %+v\n", programs.Problem)
	} else if programs.Response != nil {
		fmt.Printf("Found %d programs\n", len(*programs.Response))
		for _, program := range *programs.Response {
			fmt.Printf("  - %s: %s\n", program.ID, program.ProgramName)
		}
	}

	// Example 2: Search for events
	fmt.Println("\nSearching for events...")
	events, err := client.SearchAllEvents(ctx, nil, nil, nil)
	if err != nil {
		log.Printf("Error searching events: %v", err)
	} else if events.Problem != nil {
		fmt.Printf("API Error: %+v\n", events.Problem)
	} else if events.Response != nil {
		fmt.Printf("Found %d events\n", len(*events.Response))
		for _, event := range *events.Response {
			fmt.Printf("  - %s: %s (Program: %s)\n", event.ID, event.EventName, event.ProgramID)
		}
	}

	// Example 3: Create a new program (commented out to avoid side effects)
	/*
		newProgram := &oadr3client.Program{
			ProgramName:  "Example Program",
			RetailerName: "Example Retailer",
			ProgramType:  "PRICING_TARIFF",
			Country:      "US",
		}

		fmt.Println("\nCreating new program...")
		createdProgram, err := client.CreateProgram(ctx, newProgram)
		if err != nil {
			log.Printf("Error creating program: %v", err)
		} else if createdProgram.Problem != nil {
			fmt.Printf("API Error: %+v\n", createdProgram.Problem)
		} else if createdProgram.Response != nil {
			fmt.Printf("Created program: %s\n", createdProgram.Response.ID)
		}
	*/

	fmt.Println("\nExample completed!")
}
