package com.jobfins.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * User Entity representing both Recruiters and Job Seekers.
 * Maps to the "users" table in MySQL (Experiment 5).
 */
@Entity
@Table(name = "users")
public class User {

    // Primary Key with Auto-increment strategy (Experiment 5)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String password;

    // Role: ROLE_RECRUITER or ROLE_SEEKER
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Additional profile fields
    private String companyName;      // For Recruiters
    private String contactNumber;    // For both
    
    @Column(columnDefinition = "TEXT")
    private String bioOrSkills;      // For Job Seekers

    private LocalDateTime createdAt;

    // Default constructor required by JPA
    public User() {
    }

    // Parameterized constructor
    public User(String name, String email, String password, Role role, String companyName, String contactNumber, String bioOrSkills) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.companyName = companyName;
        this.contactNumber = contactNumber;
        this.bioOrSkills = bioOrSkills;
    }

    @PrePersist
    public void onPrePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getBioOrSkills() {
        return bioOrSkills;
    }

    public void setBioOrSkills(String bioOrSkills) {
        this.bioOrSkills = bioOrSkills;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
