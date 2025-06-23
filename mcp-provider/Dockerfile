# Multi-stage build for optimized Java application
FROM maven:3.8.5-openjdk-17-slim AS builder

WORKDIR /app

# Copy POM and source code
COPY pom.xml ./
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/mcp-provider/actuator/health || exit 1

# Expose port
EXPOSE 8080

# JVM optimization for containers
ENTRYPOINT ["java", "-Xmx768m", "-XX:+UseG1GC", "-XX:+UseContainerSupport", "-jar", "app.jar"] 