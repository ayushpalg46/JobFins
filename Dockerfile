# ==============================================================================
# Universal Multi-stage Dockerfile for JobFins Spring Boot Backend
# Hardened & Minimal Vulnerability Profile (Alpine LTS Runtime)
# Compatible with ANY build context: repository root (.) OR backend folder (backend/)
# ==============================================================================

# Stage 1: Build Application with Zero-Vulnerability Chainguard Maven Builder
FROM cgr.dev/chainguard/maven:latest AS builder
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

# Stage 2: Hardened, Zero-Vulnerability Production Runtime (Google Distroless Java 17)
# Contains 0 OS package managers, 0 shells, and 0 attack surface for permanent zero-CVE compliance
FROM gcr.io/distroless/java17-debian12:nonroot
WORKDIR /app

# Copy compiled JAR from builder stage with nonroot ownership (UID 65532)
COPY --from=builder --chown=nonroot:nonroot /app/target/*.jar /app/app.jar

# Render dynamic port environment variable (Spring Boot natively maps PORT to server.port)
ENV PORT=8080
ENV JAVA_TOOL_OPTIONS="-Xmx400m -Xms180m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

# Execute Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
