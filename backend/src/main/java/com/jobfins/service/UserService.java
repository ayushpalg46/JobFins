package com.jobfins.service;

import com.jobfins.dto.AuthResponse;
import com.jobfins.dto.LoginRequest;
import com.jobfins.dto.RegisterRequest;
import com.jobfins.model.Role;
import com.jobfins.model.User;
import com.jobfins.model.Company;
import com.jobfins.model.RoleEntity;
import com.jobfins.repository.CompanyRepository;
import com.jobfins.repository.RoleRepository;
import com.jobfins.repository.UserRepository;
import com.jobfins.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * UserService handles business logic for user registration, authentication, and profiles.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Register a new Recruiter or Seeker.
     */
    public User registerUser(RegisterRequest request) {
        // Check if email is already taken
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Determine role (ROLE_RECRUITER or ROLE_SEEKER)
        Role userRole = Role.ROLE_SEEKER;
        if (request.getRole() != null) {
            String r = request.getRole().trim().toUpperCase();
            if (r.contains("RECRUITER")) {
                userRole = Role.ROLE_RECRUITER;
            }
        }

        // Create new user entity and encode password (Experiment 6)
        User user = new User();
        String initialName = request.getName();
        if (initialName == null || initialName.trim().isEmpty()) {
            String emailPrefix = request.getEmail().split("@")[0];
            initialName = emailPrefix.substring(0, 1).toUpperCase() + emailPrefix.substring(1);
        }
        user.setName(initialName);
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);
        try {
            RoleEntity roleEntity = roleRepository.findByRoleName(userRole.name()).orElse(null);
            user.setRoleEntity(roleEntity);
        } catch (Exception ignored) {}

        user.setCompanyName(request.getCompanyName());
        user.setContactNumber(request.getContactNumber());
        user.setBioOrSkills(request.getBioOrSkills());

        User savedUser = userRepository.save(user);

        // If Recruiter registered with company name, ensure Company entity exists
        if (userRole == Role.ROLE_RECRUITER && request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            try {
                String cName = request.getCompanyName().trim();
                if (companyRepository.findByCompanyName(cName).isEmpty()) {
                    Company newCompany = new Company(
                            cName,
                            "https://" + cName.toLowerCase().replaceAll("[^a-z0-9]", "") + ".com",
                            "Hiring organization on JobFins platform.",
                            "India / Remote",
                            "Within 48 Hours",
                            savedUser
                    );
                    companyRepository.save(newCompany);
                }
            } catch (Exception ignored) {}
        }

        return savedUser;
    }

    /**
     * Authenticate credentials and return JWT token with user details.
     */
    public AuthResponse loginUser(LoginRequest request) {
        // Authenticate with Spring Security AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Fetch user from DB
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate JWT token (Experiment 6)
        String jwtToken = jwtUtils.generateToken(user);

        return new AuthResponse(
                jwtToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCompanyName()
        );
    }

    /**
     * Get user profile by email.
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}
