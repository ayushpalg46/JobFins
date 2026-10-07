package com.jobfins.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * Application Entity representing a Seeker applying for a specific Job. Maps to
 * the "applications" table in MySQL (Experiment 5).
 */
@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many applications can belong to one Job
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    // Many applications can belong to one Seeker
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seeker_id", nullable = false)
    private User seeker;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String coverLetter;

    @Lob
    @Column(name = "resume_link", columnDefinition = "LONGTEXT")
    private String resumeLink;

    // Status: PENDING, SHORTLISTED, ACCEPTED, REJECTED
    @Column(nullable = false)
    private String status;

    @Lob
    @Column(name = "offer_details", columnDefinition = "LONGTEXT")
    private String offerDetails;

    private LocalDateTime appliedDate;

    // Default constructor
    public Application() {
    }

    // Parameterized constructor
    public Application(Job job, User seeker, String coverLetter, String resumeLink) {
        this.job = job;
        this.seeker = seeker;
        this.coverLetter = coverLetter;
        this.resumeLink = resumeLink;
        this.status = "PENDING";
    }

    @PrePersist
    public void onPrePersist() {
        this.appliedDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public User getSeeker() {
        return seeker;
    }

    public void setSeeker(User seeker) {
        this.seeker = seeker;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public String getResumeLink() {
        return resumeLink;
    }

    public void setResumeLink(String resumeLink) {
        this.resumeLink = resumeLink;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOfferDetails() {
        return offerDetails;
    }

    public void setOfferDetails(String offerDetails) {
        this.offerDetails = offerDetails;
    }

    public LocalDateTime getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDateTime appliedDate) {
        this.appliedDate = appliedDate;
    }
}
