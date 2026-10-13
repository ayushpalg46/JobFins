# ==============================================================================
# Multi-stage Dockerfile for JobFins Spring Boot Backend (Backend Context)
# Compatible with Render / Docker builds where root directory / context is backend/
# ==============================================================================

# Stage 1: Build Application with Maven on Official Eclipse Temurin 17
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml and resolve dependencies
COPY pom.xml ./pom.xml
RUN mvn dependency:go-offline -B

# Copy source code and package executable fat JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Hardened Production Runtime (LTS)
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create non-root system user for container security
RUN groupadd -r jobfins && useradd -r -g jobfins -s /bin/false jobfins
USER jobfins:jobfins

# Copy compiled JAR from builder stage
COPY --from=builder --chown=jobfins:jobfins /app/target/*.jar app.jar

# Render dynamic port environment variable
ENV PORT=8080
ENV JAVA_OPTS="-Xmx400m -Xms180m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

# Execute Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.port=${PORT}"]
