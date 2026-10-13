package com.jobfins.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Job Entity representing a job vacancy posted by a Recruiter.
 * Maps to the "jobs" table in MySQL (Experiment 5).
 */
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String jobType; // Full-time, Part-time, Remote, Internship

    private String salary;  // e.g. "₹8,00,000 - ₹12,00,000 / yr"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    private LocalDateTime postedDate;

    // Many jobs can be posted by one Recruiter
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    // Association to verified Company entity
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id", nullable = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Company companyEntity;

    // Default constructor
    public Job() {
    }

    // Parameterized constructor
    public Job(String title, String company, String location, String jobType, String salary, String description, String requirements, User recruiter) {
        this.title = title;
        this.company = company;
        this.location = location;
        this.jobType = jobType;
        this.salary = salary;
        this.description = description;
        this.requirements = requirements;
        this.recruiter = recruiter;
    }

    @PrePersist
    public void onPrePersist() {
        this.postedDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public LocalDateTime getPostedDate() {
        return postedDate;
    }

    public void setPostedDate(LocalDateTime postedDate) {
        this.postedDate = postedDate;
    }

    public User getRecruiter() {
        return recruiter;
    }

    public void setRecruiter(User recruiter) {
        this.recruiter = recruiter;
    }

    public Company getCompanyEntity() {
        return companyEntity;
    }

    public void setCompanyEntity(Company companyEntity) {
        this.companyEntity = companyEntity;
    }
}
