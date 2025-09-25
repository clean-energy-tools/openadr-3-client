# OpenADR 3 Client for Java

A Java client library for the OpenADR 3.1.0 protocol.

## Requirements

- Java 17 or later
- Gradle 7.0 or later (or use included Gradle wrapper)

## Building

```bash
# Using Gradle wrapper (recommended)
./gradlew build

# Or using system Gradle
gradle build
```

## Running

```bash
# Run the example application
./gradlew run

# Run the basic test
./gradlew runBasicTest
```

## Other Gradle Tasks

```bash
# Compile only
./gradlew compileJava

# Run tests
./gradlew test

# Create JAR
./gradlew jar

# Create fat JAR with all dependencies
./gradlew fatJar

# Generate Javadoc
./gradlew javadoc
```

## Usage

```java
import com.openadr.client.OADR3;
import com.openadr.client.OADR3Config;
import com.openadr.client.APIResponse;
import com.openadr.client.model.Program;

import java.io.IOException;
import java.util.List;

public class Example {
    public static void main(String[] args) throws IOException {
        // Create client configuration
        OADR3Config config = new OADR3Config(
            "https://your-vtn-server.com",
            "your-client-id",
            "your-client-secret",
            "read_targets" // optional scope
        );

        // Create client
        OADR3 client = new OADR3(config);

        // Search for programs
        APIResponse<List<Program>> programs = client.searchAllPrograms(null, 0, 10);

        if (programs.isSuccess()) {
            List<Program> programList = programs.getResponse();
            System.out.println("Found " + programList.size() + " programs");
            
            for (Program program : programList) {
                System.out.println("  - " + program.getId() + ": " + program.getProgramName());
            }
        } else {
            System.err.println("Error: " + programs.getProblem());
        }

        // Create a new program
        Program newProgram = new Program(
            "My Program", 
            "My Retailer", 
            "PRICING_TARIFF", 
            "US"
        );

        APIResponse<Program> createdProgram = client.createProgram(newProgram);

        if (createdProgram.isSuccess()) {
            Program created = createdProgram.getResponse();
            System.out.println("Created program: " + created.getId());
        } else {
            System.err.println("Error: " + createdProgram.getProblem());
        }
    }
}
```

## Features

- **OAuth2 Authentication**: Automatic token management using Client Credentials flow
- **Complete API Coverage**: All OpenADR 3.1.0 operations implemented
- **Input/Output Validation**: Request and response validation using Jakarta Bean Validation
- **Type Safety**: Strong typing with comprehensive OpenADR 3 model classes
- **HTTP Client**: Uses OkHttp for reliable HTTP communication
- **JSON Processing**: Jackson-based JSON serialization/deserialization
- **Error Handling**: Comprehensive error handling with detailed error responses

## API Methods

### Programs
- `searchAllPrograms(targets, skip, limit)`
- `createProgram(program)`
- `searchProgramByProgramId(programId)`
- `updateProgram(programId, program)`
- `deleteProgram(programId)`

### Events
- `searchAllEvents(programId, skip, limit)`
- `createEvent(event)`

### Reports
- `searchAllReports(programId, clientName, skip, limit)`
- `createReport(report)`

### VENs
- `searchVens(venName, skip, limit)`
- `createVen(ven)`

## Configuration

The `OADR3Config` class requires:

- `baseUrl`: The VTN server base URL
- `clientId`: OAuth2 client ID
- `clientSecret`: OAuth2 client secret  
- `scope`: Optional OAuth2 scope

## Error Handling

All methods return an `APIResponse<T>` object with the following structure:

```java
public class APIResponse<T> {
    public int getStatus();           // HTTP status code
    public T getResponse();           // Response data if successful (null if error)
    public APIError getProblem();     // Error information if failed (null if successful)
    public boolean isSuccess();       // true if successful
    public boolean isError();         // true if error
}
```

## Model Classes

The client includes comprehensive model classes for all OpenADR 3 entities:

- `Program` - OpenADR programs
- `Event` - OpenADR events
- `Report` - OpenADR reports
- `Ven` - Virtual End Nodes
- `IntervalPeriod` - Time intervals

All model classes include:
- Jackson JSON annotations for serialization
- Jakarta Bean Validation annotations for validation
- Proper equals/hashCode/toString methods
- Builder-style constructors

## Validation

The client uses Jakarta Bean Validation for:
- Input parameter validation
- Request body validation
- Response data validation

Common validations include:
- Required field validation (`@NotNull`)
- String length validation (`@Size`)
- Numeric range validation
- Custom business rule validation

## Dependencies

All dependencies are managed by Gradle and automatically downloaded:

- **OkHttp 4.12.0**: HTTP client
- **Jackson 2.17.2**: JSON processing
- **Jakarta Validation 3.0.2**: Bean validation
- **Hibernate Validator 8.0.1**: Validation implementation
- **SLF4J 2.0.13**: Logging API
- **Logback 1.5.6**: Logging implementation
- **JUnit 5.10.3**: Testing framework
- **Mockito 5.12.0**: Mocking framework

## Build System

This project uses Gradle instead of Maven for build management, following the pattern used in the companion OpenADR 3 types project.

## License

Apache 2.0