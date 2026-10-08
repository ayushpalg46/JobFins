package com.jobfins.service;

import com.jobfins.dto.ApplicationRequest;
import com.jobfins.dto.StatusUpdateRequest;
import com.jobfins.model.Application;
import com.jobfins.model.Job;
import com.jobfins.model.Role;
import com.jobfins.model.User;
import com.jobfins.repository.ApplicationRepository;
import com.jobfins.repository.JobRepository;
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

    /**
     * Seeker applies for a job post.
     */
    public Application applyForJob(Long jobId, ApplicationRequest request, User seeker) {
        if (seeker.getRole() != Role.ROLE_SEEKER) {
            throw new RuntimeException("Unauthorized: Only Job Seekers can apply for jobs.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        // Check if seeker already applied to this job
        if (applicationRepository.existsByJobIdAndSeekerId(jobId, seeker.getId())) {
            throw new RuntimeException("You have already applied for this job!");
        }

        Application application = new Application(
                job,
                seeker,
                request.getCoverLetter(),
                request.getResumeLink()
        );

        return applicationRepository.save(application);
    }

    /**
     * Get all applications submitted by the logged-in seeker.
     */
    public List<Application> getMyApplications(User seeker) {
        return applicationRepository.findBySeekerIdOrderByAppliedDateDesc(seeker.getId());
    }

    /**
     * Get all applicants for a specific job post (Recruiter only).
     */
    public List<Application> getApplicantsForJob(Long jobId, User recruiter) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized: You can only view applicants for your own job listings.");
        }

        return applicationRepository.findByJobIdOrderByAppliedDateDesc(jobId);
    }

    /**
     * Get all applicants across all jobs posted by the recruiter.
     */
    public List<Application> getAllApplicantsForRecruiter(User recruiter) {
        return applicationRepository.findByJobRecruiterIdOrderByAppliedDateDesc(recruiter.getId());
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
        }
        return applicationRepository.save(application);
    }
}
