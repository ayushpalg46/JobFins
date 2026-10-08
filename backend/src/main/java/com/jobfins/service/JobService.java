package com.jobfins.service;

import com.jobfins.dto.JobRequest;
import com.jobfins.model.Job;
import com.jobfins.model.Role;
import com.jobfins.model.User;
import com.jobfins.repository.ApplicationRepository;
import com.jobfins.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * JobService handles business logic for job postings, searches, and recruiter management.
 */
@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    /**
     * Get all active jobs (newest first).
     */
    public List<Job> getAllJobs() {
        return jobRepository.findAllByOrderByPostedDateDesc();
    }

    /**
     * Search jobs by keyword (title, company, location, or job type).
     */
    public List<Job> searchJobs(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllJobs();
        }
        return jobRepository.searchJobs(keyword.trim());
    }

    /**
     * Get a specific job by ID.
     */
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job post not found with ID: " + id));
    }

    /**
     * Create a new job post (Recruiter only).
     */
    public Job createJob(JobRequest request, User recruiter) {
        if (recruiter.getRole() != Role.ROLE_RECRUITER) {
            throw new RuntimeException("Unauthorized: Only Recruiters can post jobs.");
        }

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setJobType(request.getJobType());
        job.setSalary(request.getSalary());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setRecruiter(recruiter);

        return jobRepository.save(job);
    }

    /**
     * Update an existing job post (Recruiter only).
     */
    public Job updateJob(Long id, JobRequest request, User recruiter) {
        Job job = getJobById(id);

        // Verify that the logged-in user is the owner of this job post
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized: You can only edit your own job postings.");
        }

        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setJobType(request.getJobType());
        job.setSalary(request.getSalary());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());

        return jobRepository.save(job);
    }

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    /**
     * Delete a job post (Recruiter only).
     * Cascades deletion to dependent applications to prevent foreign key errors.
     */
    @Transactional
    public void deleteJob(Long id, User recruiter) {
        Job job = getJobById(id);

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own job postings.");
        }

        // 1. Delete all dependent candidate applications first via direct SQL
        applicationRepository.deleteByJobId(id);

        // 2. Flush and clear persistence context to ensure application deletes execute immediately in MySQL
        if (entityManager != null) {
            entityManager.flush();
            entityManager.clear();
        }

        // 3. Delete the job row
        jobRepository.deleteJobByIdNative(id);
    }

    /**
     * Get all jobs posted by the logged-in recruiter.
     */
    public List<Job> getJobsByRecruiter(User recruiter) {
        return jobRepository.findByRecruiterIdOrderByPostedDateDesc(recruiter.getId());
    }
}
