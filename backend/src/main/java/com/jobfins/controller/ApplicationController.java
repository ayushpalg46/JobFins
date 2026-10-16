package com.jobfins.controller;

import com.jobfins.dto.ApiResponse;
import com.jobfins.dto.ApplicationRequest;
import com.jobfins.dto.StatusUpdateRequest;
import com.jobfins.model.Application;
import com.jobfins.model.User;
import com.jobfins.service.ApplicationService;
import com.jobfins.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ApplicationController handles REST endpoints for submitting and reviewing job applications.
 * (Experiment 4: REST Controller & CRUD operations).
 */
@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private UserService userService;

    /**
     * Seeker endpoint: Apply for a specific job.
     * POST /api/applications/apply/{jobId}
     */
    @PostMapping("/apply/{jobId}")
    public ResponseEntity<?> applyForJob(@PathVariable Long jobId,
                                         @RequestBody(required = false) ApplicationRequest request,
                                         Authentication authentication) {
        try {
            if (request == null) {
                request = new ApplicationRequest();
            }
            User seeker = userService.getUserByEmail(authentication.getName());
            Application application = applicationService.applyForJob(jobId, request, seeker);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Seeker endpoint: Get all applications submitted by the logged-in seeker.
     * GET /api/applications/my-applications
     */
    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(Authentication authentication) {
        try {
            User seeker = userService.getUserByEmail(authentication.getName());
            List<Application> applications = applicationService.getMyApplications(seeker);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Recruiter endpoint: Get all applicants for a specific job post.
     * GET /api/applications/job/{jobId}
     */
    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getApplicantsForJob(@PathVariable Long jobId, Authentication authentication) {
        try {
            User recruiter = userService.getUserByEmail(authentication.getName());
            List<Application> applicants = applicationService.getApplicantsForJob(jobId, recruiter);
            return ResponseEntity.ok(applicants);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Recruiter endpoint: Get all applicants across all jobs posted by the recruiter.
     * GET /api/applications/recruiter/all
     */
    @GetMapping("/recruiter/all")
    public ResponseEntity<?> getAllApplicantsForRecruiter(Authentication authentication) {
        try {
            User recruiter = userService.getUserByEmail(authentication.getName());
            List<Application> applicants = applicationService.getAllApplicantsForRecruiter(recruiter);
            return ResponseEntity.ok(applicants);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Recruiter endpoint: Update status of an application (e.g. SHORTLISTED, ACCEPTED, REJECTED).
     * PUT /api/applications/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @Valid @RequestBody StatusUpdateRequest request,
                                          Authentication authentication) {
        try {
            User recruiter = userService.getUserByEmail(authentication.getName());
            Application updatedApplication = applicationService.updateApplicationStatus(id, request, recruiter);
            return ResponseEntity.ok(updatedApplication);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Seeker endpoint: Candidate withdraws their job application at any stage (ACCEPTED, SHORTLISTED, PENDING, REJECTED).
     * PUT /api/applications/{id}/withdraw
     */
    @PutMapping("/{id}/withdraw")
    public ResponseEntity<?> withdrawApplication(@PathVariable Long id, Authentication authentication) {
        try {
            User seeker = userService.getUserByEmail(authentication.getName());
            Application withdrawnApp = applicationService.withdrawApplication(id, seeker);
            return ResponseEntity.ok(withdrawnApp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * Seeker endpoint: Candidate formally accepts and signs the digital offer letter.
     * PUT /api/applications/{id}/accept-offer
     */
    @PutMapping("/{id}/accept-offer")
    public ResponseEntity<?> acceptOffer(@PathVariable Long id, Authentication authentication) {
        try {
            User seeker = userService.getUserByEmail(authentication.getName());
            Application acceptedApp = applicationService.acceptOffer(id, seeker);
            return ResponseEntity.ok(acceptedApp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }

    /**
     * On-demand Resume endpoint: Fetches candidate resume on-demand for preview/download.
     * Keeps application listing responses tiny (~2KB) and prevents multi-megabyte polling bloat.
     * GET /api/applications/{id}/resume
     */
    @GetMapping("/{id}/resume")
    public ResponseEntity<?> getApplicationResume(@PathVariable Long id, Authentication authentication) {
        try {
            User user = userService.getUserByEmail(authentication.getName());
            String resumeData = applicationService.getApplicationResume(id, user);
            if (resumeData == null || resumeData.isBlank()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(java.util.Collections.singletonMap("resumeLink", resumeData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse("ERROR", e.getMessage()));
        }
    }
}
