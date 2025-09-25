package com.openadr.client.example;

import com.openadr.client.OADR3;
import com.openadr.client.OADR3Config;
import com.openadr.client.APIResponse;
import com.openadr.client.model.Program;
import com.openadr.client.model.Event;
import com.openadr.client.model.Report;
import com.openadr.client.model.Ven;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;

/**
 * Example usage of the OpenADR 3 Java client
 */
public class ExampleUsage {
    private static final Logger logger = LoggerFactory.getLogger(ExampleUsage.class);

    public static void main(String[] args) {
        // Create client configuration
        OADR3Config config = new OADR3Config(
                "https://your-vtn-server.com",
                "your-client-id",
                "your-client-secret",
                "read_targets" // optional scope
        );

        // Create client
        OADR3 client = new OADR3(config);

        try {
            // Example 1: Search for programs
            logger.info("Searching for programs...");
            APIResponse<List<Program>> programs = client.searchAllPrograms(null, 0, 10);
            
            if (programs.isSuccess()) {
                List<Program> programList = programs.getResponse();
                logger.info("Found {} programs", programList != null ? programList.size() : 0);
                
                if (programList != null) {
                    for (Program program : programList) {
                        logger.info("  - {}: {} ({})", 
                                program.getId(), 
                                program.getProgramName(), 
                                program.getProgramType());
                    }
                }
            } else {
                logger.error("Error searching programs: {}", programs.getProblem());
            }

            // Example 2: Search for events
            logger.info("\nSearching for events...");
            APIResponse<List<Event>> events = client.searchAllEvents(null, 0, 10);
            
            if (events.isSuccess()) {
                List<Event> eventList = events.getResponse();
                logger.info("Found {} events", eventList != null ? eventList.size() : 0);
                
                if (eventList != null) {
                    for (Event event : eventList) {
                        logger.info("  - {}: {} (Program: {})", 
                                event.getId(), 
                                event.getEventName(), 
                                event.getProgramId());
                    }
                }
            } else {
                logger.error("Error searching events: {}", events.getProblem());
            }

            // Example 3: Search for reports
            logger.info("\nSearching for reports...");
            APIResponse<List<Report>> reports = client.searchAllReports(null, null, 0, 10);
            
            if (reports.isSuccess()) {
                List<Report> reportList = reports.getResponse();
                logger.info("Found {} reports", reportList != null ? reportList.size() : 0);
                
                if (reportList != null) {
                    for (Report report : reportList) {
                        logger.info("  - {}: {} (Client: {})", 
                                report.getId(), 
                                report.getReportName(), 
                                report.getClientName());
                    }
                }
            } else {
                logger.error("Error searching reports: {}", reports.getProblem());
            }

            // Example 4: Search for VENs
            logger.info("\nSearching for VENs...");
            APIResponse<List<Ven>> vens = client.searchVens(null, 0, 10);
            
            if (vens.isSuccess()) {
                List<Ven> venList = vens.getResponse();
                logger.info("Found {} VENs", venList != null ? venList.size() : 0);
                
                if (venList != null) {
                    for (Ven ven : venList) {
                        logger.info("  - {}: {}", 
                                ven.getId(), 
                                ven.getVenName());
                    }
                }
            } else {
                logger.error("Error searching VENs: {}", vens.getProblem());
            }

            // Example 5: Create a new program (commented out to avoid side effects)
            /*
            logger.info("\nCreating new program...");
            Program newProgram = new Program(
                    "Example Program", 
                    "Example Retailer", 
                    "PRICING_TARIFF", 
                    "US"
            );
            newProgram.setProgramLongName("Example Long Name");
            newProgram.setRetailerLongName("Example Retailer Long Name");
            
            APIResponse<Program> createdProgram = client.createProgram(newProgram);
            
            if (createdProgram.isSuccess()) {
                Program created = createdProgram.getResponse();
                logger.info("Created program: {} (ID: {})", 
                        created.getProgramName(), created.getId());
            } else {
                logger.error("Error creating program: {}", createdProgram.getProblem());
            }
            */

            logger.info("\nExample completed successfully!");

        } catch (IOException e) {
            logger.error("Network error occurred: {}", e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
        }
    }
}