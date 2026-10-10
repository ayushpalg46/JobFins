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
    private String companyName;        // For Recruiters
    private String contactNumber;      // For both
    
    @Column(columnDefinition = "TEXT")
    private String bioOrSkills;        // For Job Seekers

    private String location;           // Address / Location (e.g. Bengaluru / Remote)
    private String portfolioUrl;       // Seeker Portfolio / GitHub / Live Web Link
    private String resumeUrl;          // Seeker Direct Resume URL / Drive Link
    private String resumeFileName;     // Uploaded Resume filename
    private Long resumeFileSize;       // Uploaded Resume size in bytes
    private String resumeUploadDate;   // Upload timestamp
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String resumeBase64;       // Uploaded PDF Base64 content for direct preview/download

    private String companyWebsite;     // Recruiter Company Website Only
    
    @Column(columnDefinition = "TEXT")
    private String companyDescription; // Recruiter Company Overview & Culture

    @Column(columnDefinition = "TEXT")
    private String hiringPreferences;  // Recruiter Hiring Preferences (Target roles, Exp range, Work mode, SLA)

    private String experienceLevel;    // Seeker Experience Level (e.g. Mid-Level 3-5 yrs)

    @Column(columnDefinition = "TEXT")
    private String experienceDetails;  // Seeker Structured Multi-Experience JSON/text entries

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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(String resumeFileName) {
        this.resumeFileName = resumeFileName;
    }

    public Long getResumeFileSize() {
        return resumeFileSize;
    }

    public void setResumeFileSize(Long resumeFileSize) {
        this.resumeFileSize = resumeFileSize;
    }

    public String getResumeUploadDate() {
        return resumeUploadDate;
    }

    public void setResumeUploadDate(String resumeUploadDate) {
        this.resumeUploadDate = resumeUploadDate;
    }

    public String getResumeBase64() {
        return resumeBase64;
    }

    public void setResumeBase64(String resumeBase64) {
        this.resumeBase64 = resumeBase64;
    }

    public String getCompanyWebsite() {
        return companyWebsite;
    }

    public void setCompanyWebsite(String companyWebsite) {
        this.companyWebsite = companyWebsite;
    }

    public String getCompanyDescription() {
        return companyDescription;
    }

    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }

    public String getHiringPreferences() {
        return hiringPreferences;
    }

    public void setHiringPreferences(String hiringPreferences) {
        this.hiringPreferences = hiringPreferences;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getExperienceDetails() {
        return experienceDetails;
    }

    public void setExperienceDetails(String experienceDetails) {
        this.experienceDetails = experienceDetails;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
