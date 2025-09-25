"""Basic usage example for OpenADR 3 Python client"""

import logging
from openadr_client import OADR3, OADR3Config
from openadr_client.models import Program, Event

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    """Example usage of the OpenADR 3 Python client"""
    
    # Create client configuration
    config = OADR3Config(
        base_url="https://your-vtn-server.com",
        client_id="your-client-id",
        client_secret="your-client-secret",
        scope="read_targets",  # optional
    )

    # Use client with context manager (recommended)
    with OADR3(config) as client:
        try:
            # Example 1: Search for programs
            logger.info("Searching for programs...")
            programs_response = client.search_all_programs(skip=0, limit=10)
            
            if programs_response.is_success:
                programs = programs_response.response
                logger.info(f"Found {len(programs) if programs else 0} programs")
                
                if programs:
                    for program in programs:
                        logger.info(f"  - {program.id}: {program.program_name} ({program.program_type})")
            else:
                logger.error(f"Error searching programs: {programs_response.problem}")

            # Example 2: Search for events  
            logger.info("\nSearching for events...")
            events_response = client.search_all_events(skip=0, limit=10)
            
            if events_response.is_success:
                events = events_response.response
                logger.info(f"Found {len(events) if events else 0} events")
                
                if events:
                    for event in events:
                        logger.info(f"  - {event.id}: {event.event_name} (Program: {event.program_id})")
            else:
                logger.error(f"Error searching events: {events_response.problem}")

            # Example 3: Create a new program (commented out to avoid side effects)
            """
            logger.info("\nCreating new program...")
            new_program = Program(
                program_name="Example Program",
                retailer_name="Example Retailer", 
                program_type="PRICING_TARIFF",
                country="US",
            )
            
            created_response = client.create_program(new_program)
            
            if created_response.is_success:
                created_program = created_response.response
                logger.info(f"Created program: {created_program.program_name} (ID: {created_program.id})")
            else:
                logger.error(f"Error creating program: {created_response.problem}")
            """

            logger.info("\nExample completed successfully!")

        except Exception as e:
            logger.error(f"Error occurred: {e}")


if __name__ == "__main__":
    main()