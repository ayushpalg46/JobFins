package com.jobfins.controller;

import com.jobfins.dto.ApiResponse;
import com.jobfins.dto.JobRequest;
import com.jobfins.model.Job;
import com.jobfins.model.User;
import com.jobfins.service.JobService;
import com.jobfins.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * JobController handles REST endpoints for viewing, searching, and managing job postings.
 * (Experiment 4: REST Controller & CRUD operations).
 */
@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private UserService userService;

    /**
     * Public endpoint: Get all jobs or search by keyword.
     * GET /api/jobs or GET /api/jobs?keyword=java
     */
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ResponseEntity.ok(jobService.searchJobs(keyword));
        }
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    /**
     * Public endpoint: Get job details by ID.
     * GET /api/jobs/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        try {
            Job job = jobService.getJobById(id);
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Recruiter endpoint: Post a new job.
     * POST /api/jobs
     */
    @PostMapping
    public ResponseEntity<?> createJob(@Valid @RequestBody JobRequest request, Authentication authentication) {
        try {
            User recruiter = userService.getUserByEmail(authentication.getName());
            Job createdJob = jobService.createJob(request, recruiter);
            return ResponseEntity.ok(createdJob);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Recruiter endpoint: Update an existing job post.
     * PUT /api/jobs/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest request, Authentication authentication) {
        try {
            User recruiter = userService.getUserByEmail(authentication.getName());
            Job updatedJob = jobService.updateJob(id, request, recruiter);
            return ResponseEntity.ok(updatedJob);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Recruiter endpoint: Delete a job post.
     * DELETE /api/jobs/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id, Authentication authentication) {
        try {
            User recruiter = userService.getUserByEmail(authentication.getName());
            jobService.deleteJob(id, recruiter);
            return ResponseEntity.ok(new ApiResponse("SUCCESS", "Job deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Recruiter endpoint: Get all jobs posted by the currently logged-in recruiter.
     * GET /api/jobs/my-jobs
     */
    @GetMapping("/my-jobs")
    public ResponseEntity<?> getMyJobs(Authentication authentication) {
        try {
            User recruiter = userService.getUserByEmail(authentication.getName());
            List<Job> myJobs = jobService.getJobsByRecruiter(recruiter);
            return ResponseEntity.ok(myJobs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }
}
