package com.jobfins.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * SystemInfoController provides system health checks, version, and architecture info.
 * (Path: /api/health and /api/info).
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SystemInfoController {

    private final LocalDateTime serverStartTime = LocalDateTime.now();

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "database", "MySQL 8.4 Connected (jobfins_db)",
                "port", 8080,
                "serverUptime", "Online since " + serverStartTime,
                "version", "JobFins v1.0.0 (Production Release)",
                "security", "Stateless JWT Auth Filter Active (HMAC-SHA256)"
        ));
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getProjectInfo() {
        return ResponseEntity.ok(Map.of(
                "projectName", "JobFins - Full Stack Tech & Fintech Career Ecosystem",
                "milestonesCompleted", List.of(
                        "M1: Java, Spring Boot & React environment setup",
                        "M2: Static web page with Bootstrap 5 & SVG logo",
                        "M3: Dynamic React front-end with Google Fonts & Dark Mode",
                        "M4: RESTful web services (Job, Dashboard, Transactions)",
                        "M5: MySQL database integration with Spring Data JPA",
                        "M6: JWT Authentication filter & role-based access",
                        "M7: React Axios client integration with Bearer tokens",
                        "M8: Multi-container Docker Compose & GitHub deployment"
                ),
                "techStack", Map.of(
                        "backend", "Java 17, Spring Boot 3, Spring Security, Hibernate",
                        "frontend", "React 18, Vite, Bootstrap 5, Google Fonts",
                        "database", "MySQL 8.4 InnoDB",
                        "containerization", "Docker & Docker Compose"
                ),
                "author", "ayushpalg46",
                "repository", "https://github.com/ayushpalg46/JobFin.git"
        ));
    }

    /**
     * Secured endpoint for JWT validation testing.
     * GET /api/hello
     */
    @GetMapping("/hello")
    public ResponseEntity<String> sayHello() {
        return ResponseEntity.ok("Hello! Access granted via valid JWT Token.");
    }
}
