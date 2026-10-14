# ==============================================================================
# Universal Multi-stage Dockerfile for JobFins Spring Boot Backend
# Hardened & Minimal Vulnerability Profile (Alpine LTS Runtime)
# Compatible with ANY build context: repository root (.) OR backend folder (backend/)
# ==============================================================================

# Stage 1: Build Application with Maven on Eclipse Temurin 17 Alpine
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy build context into staging area
COPY . /build/

# Dynamically detect context (root vs backend) and compile executable JAR
RUN if [ -f /build/pom.xml ]; then \
        echo "==> Build context is backend directory" && cp -r /build/* /app/; \
    elif [ -f /build/backend/pom.xml ]; then \
        echo "==> Build context is repository root" && cp -r /build/backend/* /app/; \
    else \
        echo "ERROR: pom.xml not found in build context" && exit 1; \
    fi && \
    cd /app && mvn clean package -DskipTests -B

# Stage 2: Hardened, Zero-Vulnerability Production Runtime (Eclipse Temurin 17 Alpine 3.21)
FROM eclipse-temurin:17-jre-alpine-3.21
WORKDIR /app

# Upgrade OS packages & create non-root system user for container security
RUN apk update && apk upgrade --no-cache && \
    addgroup -S jobfins && adduser -S -G jobfins -s /bin/sh jobfins
USER jobfins:jobfins

# Copy compiled JAR from builder stage
COPY --from=builder --chown=jobfins:jobfins /app/target/*.jar app.jar

# Render dynamic port environment variable
ENV PORT=8080
ENV JAVA_OPTS="-Xmx400m -Xms180m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

# Execute Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.port=${PORT}"]
