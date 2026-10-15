package com.jobfins.service;

import com.jobfins.dto.ApplicationRequest;
import com.jobfins.dto.StatusUpdateRequest;
import com.jobfins.model.Application;
import com.jobfins.model.Job;
import com.jobfins.model.Role;
import com.jobfins.model.User;
import com.jobfins.model.OfferLetter;
import com.jobfins.repository.ApplicationRepository;
import com.jobfins.repository.JobRepository;
import com.jobfins.repository.OfferLetterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ApplicationService handles business logic for job applications, applicant reviews, and status updates.
 */
@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private OfferLetterRepository offerLetterRepository;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    /**
     * Seeker applies for a job post.
     * Allows re-application if previous application was withdrawn.
     */
    public Application applyForJob(Long jobId, ApplicationRequest request, User seeker) {
        if (seeker.getRole() != Role.ROLE_SEEKER) {
            throw new RuntimeException("Unauthorized: Only Job Seekers can apply for jobs.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        // Check if seeker already applied to this job
        java.util.Optional<Application> existingOpt = applicationRepository.findByJobIdAndSeekerId(jobId, seeker.getId());
        Application application;
        if (existingOpt.isPresent()) {
            Application existing = existingOpt.get();
            if (!"WITHDRAWN".equalsIgnoreCase(existing.getStatus())) {
                throw new RuntimeException("You have already applied for this job!");
            }
            // Reactivate withdrawn application
            application = existing;
            application.setStatus("PENDING");
            application.setCoverLetter(request.getCoverLetter());
            application.setResumeLink(request.getResumeLink());
            application.setAppliedDate(java.time.LocalDateTime.now());
        } else {
            application = new Application(
                    job,
                    seeker,
                    request.getCoverLetter(),
                    request.getResumeLink()
            );
        }

        // Automatic ATS Evaluation Score simulation
        int atsScore = 88;
        if (seeker.getBioOrSkills() != null && !seeker.getBioOrSkills().isBlank()) {
            atsScore = 92;
            String skills = seeker.getBioOrSkills();
            application.setAtsKeywordsMatched(skills.length() > 80 ? skills.substring(0, 80) : skills);
        }
        application.setAtsScore(atsScore);
        application.setAtsStatus(atsScore >= 80 ? "HIGH_MATCH" : "MODERATE_MATCH");

        return applicationRepository.save(application);
    }

    /**
     * Seeker withdraws their job application regardless of current status (PENDING, SHORTLISTED, ACCEPTED, REJECTED).
     */
    public Application withdrawApplication(Long applicationId, User seeker) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with ID: " + applicationId));

        // Verify that the application belongs to the logged-in seeker
        if (!application.getSeeker().getId().equals(seeker.getId())) {
            throw new RuntimeException("Unauthorized: You can only withdraw your own applications.");
        }

        application.setStatus("WITHDRAWN");
        return applicationRepository.save(application);
    }

    /**
     * Get on-demand candidate resume data for preview or download.
     */
    public String getApplicationResume(Long applicationId, User user) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with ID: " + applicationId));

        boolean isRecruiter = application.getJob().getRecruiter().getId().equals(user.getId());
        boolean isSeeker = application.getSeeker().getId().equals(user.getId());
        if (!isRecruiter && !isSeeker) {
            throw new RuntimeException("Unauthorized: You do not have permission to view this resume.");
        }

        return application.getResumeLink();
    }

    /**
     * Get all applications submitted by the logged-in seeker.
     * Payload-optimized: Detaches entities and replaces heavy multi-MB raw base64 data URIs
     * with lightweight document indicators, reducing network transfer from MBs to KBs.
     */
    public List<Application> getMyApplications(User seeker) {
        List<Application> apps = applicationRepository.findBySeekerIdOrderByAppliedDateDesc(seeker.getId());
        if (entityManager != null) {
            for (Application app : apps) {
                entityManager.detach(app);
                if (app.getResumeLink() != null && app.getResumeLink().startsWith("data:")) {
                    String ext = (app.getResumeLink().contains("wordprocessingml") || app.getResumeLink().contains("UEsDB")) ? "docx" : "pdf";
                    app.setResumeLink("ON_DEMAND_REF:" + app.getId() + ":" + ext);
                }
            }
        }
        return apps;
    }

    /**
     * Get all applicants for a specific job post (Recruiter only).
     * Payload-optimized to stream on-demand resume references instead of multi-MB inline blobs.
     */
    public List<Application> getApplicantsForJob(Long jobId, User recruiter) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized: You can only view applicants for your own job listings.");
        }

        List<Application> applicants = applicationRepository.findByJobIdOrderByAppliedDateDesc(jobId);
        if (entityManager != null) {
            for (Application app : applicants) {
                entityManager.detach(app);
                if (app.getResumeLink() != null && app.getResumeLink().startsWith("data:")) {
                    String ext = (app.getResumeLink().contains("wordprocessingml") || app.getResumeLink().contains("UEsDB")) ? "docx" : "pdf";
                    app.setResumeLink("ON_DEMAND_REF:" + app.getId() + ":" + ext);
                }
            }
        }
        return applicants;
    }

    /**
     * Get all applicants across all jobs posted by the recruiter.
     * Payload-optimized: Converts large inline base64 data URIs into on-demand references,
     * shrinking the JSON payload from 50MB-100MB down to ~2KB-5KB.
     */
    public List<Application> getAllApplicantsForRecruiter(User recruiter) {
        List<Application> applicants = applicationRepository.findByJobRecruiterIdOrderByAppliedDateDesc(recruiter.getId());
        if (entityManager != null) {
            for (Application app : applicants) {
                entityManager.detach(app);
                if (app.getResumeLink() != null && app.getResumeLink().startsWith("data:")) {
                    String ext = (app.getResumeLink().contains("wordprocessingml") || app.getResumeLink().contains("UEsDB")) ? "docx" : "pdf";
                    app.setResumeLink("ON_DEMAND_REF:" + app.getId() + ":" + ext);
                }
            }
        }
        return applicants;
    }

    /**
     * Recruiter updates application status (e.g. SHORTLISTED, ACCEPTED, REJECTED).
     */
    public Application updateApplicationStatus(Long applicationId, StatusUpdateRequest request, User recruiter) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with ID: " + applicationId));

        // Verify that the recruiter owns the job post
        if (!application.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized: You can only update applicants for your own jobs.");
        }

        String newStatus = request.getStatus().toUpperCase();
        String currentStatus = application.getStatus() != null ? application.getStatus().toUpperCase() : "PENDING";

        // Rule: Accepted candidate cannot be rejected
        if ("ACCEPTED".equals(currentStatus) && "REJECTED".equals(newStatus)) {
            throw new RuntimeException("Candidate has already been accepted with a formal offer and cannot be rejected.");
        }

        // Rule: Candidate must be shortlisted before being accepted
        if ("ACCEPTED".equals(newStatus) && !"SHORTLISTED".equals(currentStatus) && !"ACCEPTED".equals(currentStatus)) {
            throw new RuntimeException("Candidate must be shortlisted before being accepted.");
        }

        application.setStatus(newStatus);
        if (request.getOfferDetails() != null && !request.getOfferDetails().isBlank()) {
            application.setOfferDetails(request.getOfferDetails());
            try {
                com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(request.getOfferDetails());
                if (root.has("baseSalary")) application.setBaseSalary("₹" + root.get("baseSalary").asText());
                if (root.has("bonus")) application.setPerformanceBonus("₹" + root.get("bonus").asText());
                if (root.has("esops")) application.setStockOptions("₹" + root.get("esops").asText());
                if (root.has("joiningDate")) application.setJoiningDate(root.get("joiningDate").asText());
                if (root.has("department")) application.setReportingManager(root.get("department").asText());
                if (root.has("acceptanceDeadline")) application.setAcceptanceDeadline(root.get("acceptanceDeadline").asText());
            } catch (com.fasterxml.jackson.core.JsonProcessingException | RuntimeException ignored) {}
            syncOfferLetterEntity(application, request.getOfferDetails());
        }
        return applicationRepository.save(application);
    }

    private void syncOfferLetterEntity(Application application, String offerJson) {
        try {
            OfferLetter offer = offerLetterRepository.findByApplicationId(application.getId())
                    .orElse(new OfferLetter());
            offer.setApplication(application);
            offer.setStatus("ISSUED");
            offer.setTermsAndConditions(offerJson);
            if (offerJson != null && offerJson.contains("baseSalary")) {
                com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(offerJson);
                if (root.has("baseSalary")) offer.setBaseSalary("₹" + root.get("baseSalary").asText());
                if (root.has("bonus")) offer.setPerformanceBonus("₹" + root.get("bonus").asText());
                if (root.has("esops")) offer.setStockOptions("₹" + root.get("esops").asText());
                if (root.has("joiningDate")) offer.setJoiningDate(root.get("joiningDate").asText());
                if (root.has("department")) offer.setReportingManager(root.get("department").asText());
                if (root.has("acceptanceDeadline")) offer.setAcceptanceSla(root.get("acceptanceDeadline").asText());
            }
            offerLetterRepository.save(offer);
        } catch (com.fasterxml.jackson.core.JsonProcessingException | RuntimeException ignored) {
        }
    }
}
