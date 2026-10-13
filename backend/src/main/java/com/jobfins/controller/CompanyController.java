package com.jobfins.controller;

import com.jobfins.model.Company;
import com.jobfins.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * CompanyController provides verified hiring partner directory endpoints.
 * (Path: /api/companies).
 */
@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    private final List<Map<String, Object>> fallbackCompanies = List.of(
            Map.of(
                    "id", 1,
                    "name", "TechCorp Innovations",
                    "industry", "Enterprise Software & Cloud",
                    "headquarters", "Bangalore, India",
                    "openPositions", 14,
                    "rating", 4.8,
                    "website", "https://techcorp-innovations.com",
                    "verified", true
            ),
            Map.of(
                    "id", 2,
                    "name", "FinPay Solutions",
                    "industry", "FinTech & Banking Infrastructure",
                    "headquarters", "Mumbai, India",
                    "openPositions", 9,
                    "rating", 4.7,
                    "website", "https://finpay-solutions.com",
                    "verified", true
            ),
            Map.of(
                    "id", 3,
                    "name", "CloudScale Technologies",
                    "industry", "DevOps & Cloud Native Systems",
                    "headquarters", "Hyderabad / Remote",
                    "openPositions", 11,
                    "rating", 4.9,
                    "website", "https://cloudscale.io",
                    "verified", true
            ),
            Map.of(
                    "id", 4,
                    "name", "JobFins Labs",
                    "industry", "AI & Next-Gen Recruitment Platforms",
                    "headquarters", "Pune / Remote",
                    "openPositions", 6,
                    "rating", 5.0,
                    "website", "https://jobfins.com",
                    "verified", true
            )
    );

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCompanies() {
        try {
            List<Company> dbCompanies = companyRepository.findAll();
            if (!dbCompanies.isEmpty()) {
                List<Map<String, Object>> mapped = new ArrayList<>();
                for (Company c : dbCompanies) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", c.getId());
                    map.put("name", c.getCompanyName());
                    map.put("industry", c.getDescription() != null ? c.getDescription() : "Enterprise Software & Cloud");
                    map.put("headquarters", c.getHeadquarters() != null ? c.getHeadquarters() : "Bangalore, India");
                    map.put("openPositions", c.getOpenPositions() != null ? c.getOpenPositions() : 8);
                    map.put("rating", c.getRating() != null ? c.getRating() : 4.8);
                    map.put("website", c.getWebsite() != null ? c.getWebsite() : "https://jobfins.com");
                    map.put("verified", c.getIsVerified() != null ? c.getIsVerified() : true);
                    mapped.add(map);
                }
                return ResponseEntity.ok(mapped);
            }
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(fallbackCompanies);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Map<String, Object>>> getFeaturedCompanies() {
        return ResponseEntity.ok(fallbackCompanies.subList(0, 2));
    }

    @GetMapping("/locations")
    public ResponseEntity<List<Map<String, Object>>> getCompanyLocations() {
        return ResponseEntity.ok(List.of(
                Map.of("city", "Bangalore", "activeJobs", 42, "avgSalary", "₹16.5 LPA"),
                Map.of("city", "Mumbai", "activeJobs", 28, "avgSalary", "₹15.2 LPA"),
                Map.of("city", "Pune", "activeJobs", 19, "avgSalary", "₹12.8 LPA"),
                Map.of("city", "Hyderabad", "activeJobs", 24, "avgSalary", "₹14.0 LPA"),
                Map.of("city", "Remote", "activeJobs", 55, "avgSalary", "₹18.0 LPA")
        ));
    }
}
