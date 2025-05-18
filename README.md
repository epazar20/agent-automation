# Microservices Project

This project contains two Spring Boot microservices:

1. **agent-provider** - Running on port 8081
2. **ai-provider** - Running on port 8082

## Prerequisites

- Java 17
- Maven

## How to Build

To build all modules:

```bash
mvn clean install
```

## How to Run

### Running agent-provider

```bash
cd agent-provider
mvn spring-boot:run
```

The service will be available at: http://localhost:8081

### Running ai-provider

```bash
cd ai-provider
mvn spring-boot:run
```

The service will be available at: http://localhost:8082

## Project Structure

```
.
├── agent-provider/           # Agent Provider Microservice
│   ├── src/                  # Source code
│   └── pom.xml               # Maven configuration
├── ai-provider/              # AI Provider Microservice
│   ├── src/                  # Source code
│   └── pom.xml               # Maven configuration
└── pom.xml                   # Parent Maven configuration
```

## Development Setup

### Environment Configuration

1. Create a copy of `application-secrets.properties.example` as `application-secrets.properties` in the following locations:
   - `agent-provider/src/main/resources/`

2. Update the secret values in your local `application-secrets.properties` files with your actual API keys:
   ```properties
   RAPIDAPI_YOUTUBE_TRANSCRIPTOR_KEY=your_rapidapi_key
   DEEPL_API_AUTH_KEY=your_deepl_api_key
   ```

3. Never commit `application-secrets.properties` files to version control. They are already added to `.gitignore`.

### Running the Application

1. Ensure you have completed the environment configuration steps above.
2. The application will automatically load the appropriate properties files based on the active profile.
3. For local development, the application will use default URLs if not specified in the environment. 