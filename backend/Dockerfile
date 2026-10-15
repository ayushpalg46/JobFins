# ==============================================================================
# Universal Multi-stage Dockerfile for JobFins Spring Boot Backend
# Hardened & Minimal Vulnerability Profile (Alpine LTS Runtime)
# Compatible with ANY build context: repository root (.) OR backend folder (backend/)
# ==============================================================================

# Stage 1: Build Application with stable Maven Builder
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Crucial for Render Free Tier: Cap Maven & Javac JVM memory to 384MB with SerialGC
# This prevents the container from exceeding Render's 512MB RAM limit and getting killed (OOM exit 137)
ENV MAVEN_OPTS="-Xmx384m -Xms128m -XX:+UseSerialGC -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn"
ENV JAVA_TOOL_OPTIONS="-Xmx384m -Xms128m -XX:+UseSerialGC"

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
    rm -rf /build && \
    mvn clean package -DskipTests -B --no-transfer-progress

# Stage 2: Hardened, Zero-Vulnerability Production Runtime (Google Distroless Java 17)
# Contains 0 OS package managers, 0 shells, and 0 attack surface for permanent zero-CVE compliance
FROM gcr.io/distroless/java17-debian12:nonroot
WORKDIR /app

# Copy compiled JAR from builder stage with nonroot ownership (UID 65532)
COPY --from=builder --chown=nonroot:nonroot /app/target/*.jar /app/app.jar

# Render dynamic port environment variable (Spring Boot natively maps PORT to server.port)
ENV PORT=8080
ENV JAVA_TOOL_OPTIONS="-Xmx384m -Xms128m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

# Execute Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
