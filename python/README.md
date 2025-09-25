# OpenADR 3 Client for Python

A Python client library for the OpenADR 3.1.0 protocol.

## Requirements

- Python 3.11 or later
- pip or another Python package manager

## Installation

```bash
# Install in development mode
pip install -e .

# Or install from wheel
pip install dist/openadr_3_client-*.whl
```

## Quick Start

```python
from openadr_client import OADR3, OADR3Config
from openadr_client.models import Program

# Create client configuration
config = OADR3Config(
    base_url="https://your-vtn-server.com",
    client_id="your-client-id",
    client_secret="your-client-secret",
    scope="read_targets"  # optional
)

# Use client with context manager (recommended)
with OADR3(config) as client:
    # Search for programs
    programs = client.search_all_programs(limit=10)
    
    if programs.is_success:
        for program in programs.response:
            print(f"Program: {program.program_name}")
    else:
        print(f"Error: {programs.problem}")

    # Create a new program
    new_program = Program(
        program_name="My Program",
        retailer_name="My Retailer",
        program_type="PRICING_TARIFF",
        country="US"
    )
    
    result = client.create_program(new_program)
    if result.is_success:
        print(f"Created program: {result.response.id}")
```

## Building

```bash
# Build wheel
pip install build
python -m build

# Install development dependencies
pip install -e .[dev]

# Run tests
pytest

# Run type checking
mypy src/

# Format code
black src/ tests/ examples/
isort src/ tests/ examples/
```

## Features

- **OAuth2 Authentication**: Automatic token management using Client Credentials flow
- **Complete API Coverage**: All OpenADR 3.1.0 operations implemented
- **Input/Output Validation**: Request and response validation using Pydantic models
- **Type Safety**: Full type hints with mypy support
- **Async Support**: Built on httpx for modern async HTTP capabilities
- **Context Manager**: Proper resource management with context manager support

## API Methods

### Programs
- `search_all_programs(targets, skip, limit)` - Search all programs
- `create_program(program)` - Create a new program
- `search_program_by_program_id(program_id)` - Get program by ID
- `update_program(program_id, program)` - Update existing program
- `delete_program(program_id)` - Delete a program

### Events
- `search_all_events(program_id, skip, limit)` - Search all events
- `create_event(event)` - Create a new event

### Reports
- `search_all_reports(program_id, client_name, skip, limit)` - Search all reports
- `create_report(report)` - Create a new report

### VENs
- `search_vens(ven_name, skip, limit)` - Search VENs
- `create_ven(ven)` - Create a new VEN

## Configuration

The `OADR3Config` dataclass requires:

- `base_url`: The VTN server base URL
- `client_id`: OAuth2 client ID
- `client_secret`: OAuth2 client secret
- `scope`: Optional OAuth2 scope
- `timeout`: Request timeout in seconds (default: 30)

## Error Handling

All methods return an `APIResponse[T]` object with:

```python
@dataclass
class APIResponse:
    status: int                    # HTTP status code
    response: Optional[T] = None   # Response data if successful
    problem: Optional[APIError] = None  # Error information if failed
    
    @property
    def is_success(self) -> bool   # True if successful
    
    @property 
    def is_error(self) -> bool     # True if error
```

## Model Classes

The client includes Pydantic model classes for all OpenADR 3 entities:

- `Program` - OpenADR programs
- `Event` - OpenADR events  
- `Report` - OpenADR reports
- `Ven` - Virtual End Nodes

All models include:
- Pydantic validation
- Type hints
- JSON serialization/deserialization
- Field validation and constraints

## Validation

The client uses Pydantic for:
- Input parameter validation
- Request body validation
- Response data validation

Common validations include:
- Required field validation
- Type validation
- Custom business rule validation

## Dependencies

- **httpx**: Modern async HTTP client
- **authlib**: OAuth2 authentication
- **pydantic**: Data validation and serialization
- **typing-extensions**: Extended type hints

## Development Dependencies

- **pytest**: Testing framework
- **mypy**: Static type checking
- **black**: Code formatting
- **isort**: Import sorting
- **pytest-cov**: Test coverage

## Examples

See the `examples/` directory for comprehensive usage examples:

- `basic_usage.py` - Basic client usage
- More examples coming soon

## Integration with OpenADR 3 Types

The client is designed to work with the external OpenADR 3 types from `../openadr-3-ts-types/python/`. Currently, it includes basic implementations of core types for standalone operation.

To use the full external types package:
1. Install the external types package as a dependency
2. Update imports to use external validation functions
3. Replace local model classes with external models

## License

Apache 2.0