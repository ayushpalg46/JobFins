package com.jobfins.controller;

import com.jobfins.model.User;
import com.jobfins.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * UserController provides endpoints to get and update the authenticated user's profile.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get current user profile by authenticated JWT email.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        return ResponseEntity.ok(userOpt.get());
    }

    /**
     * Update current user profile.
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User profileData) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();
        if (profileData.getName() != null) user.setName(profileData.getName());
        if (profileData.getContactNumber() != null) user.setContactNumber(profileData.getContactNumber());
        if (profileData.getBioOrSkills() != null) user.setBioOrSkills(profileData.getBioOrSkills());
        if (profileData.getCompanyName() != null) user.setCompanyName(profileData.getCompanyName());

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    /**
     * Get all registered job seekers for recruiter talent sourcing.
     */
    @GetMapping("/candidates")
    public ResponseEntity<?> getAllCandidates() {
        return ResponseEntity.ok(userRepository.findByRole(com.jobfins.model.Role.ROLE_SEEKER));
    }
}
