package com.jobfins.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for User Registration (Recruiter or Seeker).
 * Handles incoming JSON payload in AuthController.
 */
public class RegisterRequest {

    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // "ROLE_RECRUITER" or "ROLE_SEEKER" (or "RECRUITER" / "SEEKER")
    @NotBlank(message = "Role is required")
    private String role;

    private String companyName;      // Used if role is RECRUITER
    private String contactNumber;
    private String bioOrSkills;      // Used if role is SEEKER

    public RegisterRequest() {
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
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
}
