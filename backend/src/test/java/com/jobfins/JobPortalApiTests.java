package com.jobfins;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobfins.dto.ApplicationRequest;
import com.jobfins.dto.JobRequest;
import com.jobfins.dto.LoginRequest;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for all REST API endpoints:
 * Auth, Dashboard Stats, Jobs CRUD, and Applications.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class JobPortalApiTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String recruiterToken;
    private static String seekerToken;

    @Test
    @Order(1)
    void testDashboardStatsPublicEndpoint() throws Exception {
        // GET /api/dashboard/stats
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalJobs").exists())
                .andExpect(jsonPath("$.totalSeekers").exists())
                .andExpect(jsonPath("$.totalRecruiters").exists());
    }

    @Test
    @Order(2)
    void testPublicJobsListing() throws Exception {
        // GET /api/jobs
        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @Order(3)
    void testRecruiterLogin() throws Exception {
        // POST /api/auth/login
        LoginRequest loginRequest = new LoginRequest("recruiter@jobfins.com", "password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("ROLE_RECRUITER"))
                .andReturn();

        String response = result.getResponse().getContentAsString();
        recruiterToken = objectMapper.readTree(response).get("token").asText();
    }

    @Test
    @Order(4)
    void testSeekerLogin() throws Exception {
        // POST /api/auth/login
        LoginRequest loginRequest = new LoginRequest("seeker@jobfins.com", "password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("ROLE_SEEKER"))
                .andReturn();

        String response = result.getResponse().getContentAsString();
        seekerToken = objectMapper.readTree(response).get("token").asText();
    }

    @Test
    @Order(5)
    void testRecruiterPostJob() throws Exception {
        // Recruiter posts a job using Bearer token
        JobRequest jobRequest = new JobRequest();
        jobRequest.setTitle("Senior Quantitative Analyst");
        jobRequest.setCompany("FinTech Global");
        jobRequest.setLocation("Mumbai, Maharashtra");
        jobRequest.setJobType("Full-time");
        jobRequest.setSalary("₹18,00,000 - ₹24,00,000 / yr");
        jobRequest.setDescription("Leading quantitative financial modeling and algorithmic strategies.");
        jobRequest.setRequirements("Strong Java, Python, and Mathematics background.");

        mockMvc.perform(post("/api/jobs")
                        .header("Authorization", "Bearer " + recruiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jobRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Senior Quantitative Analyst"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @Order(6)
    void testSeekerSearchJobs() throws Exception {
        // Search jobs with keyword
        mockMvc.perform(get("/api/jobs?keyword=Java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @Order(7)
    void testSeekerApplyJob() throws Exception {
        // Seeker applies for Job 2 with Bearer token
        ApplicationRequest appRequest = new ApplicationRequest(
                "I am deeply passionate about financial analysis and quant engineering.",
                "https://drive.google.com/resume-rohan.pdf"
        );

        mockMvc.perform(post("/api/applications/apply/2")
                        .header("Authorization", "Bearer " + seekerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.job.id").value(2));
    }

    @Test
    @Order(8)
    void testSeekerGetMyApplications() throws Exception {
        // Seeker views their applied jobs
        mockMvc.perform(get("/api/applications/my-applications")
                        .header("Authorization", "Bearer " + seekerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @Order(9)
    void testRecruiterGetApplicants() throws Exception {
        // Recruiter views applicants for their jobs
        mockMvc.perform(get("/api/applications/recruiter/all")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @Order(10)
    void testSalaryGuideEndpoint() throws Exception {
        mockMvc.perform(get("/api/salary-guide"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].role").value("Java Backend Developer"));
    }

    @Test
    @Order(11)
    void testDashboardStatsOutput() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hiringSuccessRate").value("94.2%"));
    }

    @Test
    @Order(12)
    void testCompaniesListEndpoint() throws Exception {
        mockMvc.perform(get("/api/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").exists());
    }
}
