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