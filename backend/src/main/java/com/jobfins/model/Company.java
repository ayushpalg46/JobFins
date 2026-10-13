package com.jobfins.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Company Entity representing an organization / employer partner.
 * Maps to the "companies" table in MySQL.
 */
@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String headquarters;

    private String responseSla; // e.g. "Within 24 Hours", "<48h Guaranteed"

    @Column(columnDefinition = "TEXT")
    private String hiringPreferences;

    private Double rating = 4.8;

    private Integer openPositions = 0;

    private Boolean isVerified = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recruiter_id", nullable = true)
    @JsonIgnoreProperties({"password", "resumeBase64", "experienceDetails"})
    private User recruiter;

    private LocalDateTime createdAt;

    public Company() {
    }

    public Company(String companyName, String website, String description, String headquarters, String responseSla, User recruiter) {
        this.companyName = companyName;
        this.website = website;
        this.description = description;
        this.headquarters = headquarters;
        this.responseSla = responseSla;
        this.recruiter = recruiter;
        this.rating = 4.8;
        this.openPositions = 1;
        this.isVerified = true;
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHeadquarters() {
        return headquarters;
    }

    public void setHeadquarters(String headquarters) {
        this.headquarters = headquarters;
    }

    public String getResponseSla() {
        return responseSla;
    }

    public void setResponseSla(String responseSla) {
        this.responseSla = responseSla;
    }

    public String getHiringPreferences() {
        return hiringPreferences;
    }

    public void setHiringPreferences(String hiringPreferences) {
        this.hiringPreferences = hiringPreferences;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getOpenPositions() {
        return openPositions;
    }

    public void setOpenPositions(Integer openPositions) {
        this.openPositions = openPositions;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public User getRecruiter() {
        return recruiter;
    }

    public void setRecruiter(User recruiter) {
        this.recruiter = recruiter;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
