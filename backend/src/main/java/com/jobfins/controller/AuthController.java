package com.jobfins.controller;

import com.jobfins.dto.ApiResponse;
import com.jobfins.dto.AuthResponse;
import com.jobfins.dto.LoginRequest;
import com.jobfins.dto.RegisterRequest;
import com.jobfins.model.User;
import com.jobfins.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController handles user registration, login, and authentication verification.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * Endpoint for user registration (Recruiter or Seeker).
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            User registeredUser = userService.registerUser(request);
            return ResponseEntity.ok(new ApiResponse("SUCCESS", "User registered successfully with role: " + registeredUser.getRole().name(), registeredUser.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Endpoint for user login returning JWT Bearer token.
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse authResponse = userService.loginUser(request);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", "Invalid email or password!"));
        }
    }

    /**
     * Endpoint to get profile of currently authenticated user.
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiResponse("ERROR", "User is not authenticated"));
        }
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(user);
    }

    /**
     * Secured endpoint for JWT validation testing.
     * GET /api/auth/hello
     */
    @GetMapping("/hello")
    public ResponseEntity<String> sayHello(Authentication authentication) {
        return ResponseEntity.ok("Hello! Access granted via valid JWT Token.");
    }
}
