package com.jobfins.controller;

import com.jobfins.model.CareerTip;
import com.jobfins.model.User;
import com.jobfins.repository.CareerTipRepository;
import com.jobfins.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/career-tips")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CareerTipsController {

    @Autowired
    private CareerTipRepository careerTipRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CareerTip>> getAllTips() {
        return ResponseEntity.ok(careerTipRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<?> createTip(@RequestBody CareerTip tipRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String authorName = "Community Member";
        String authorRole = "ROLE_SEEKER";
        String authorCompany = null;
        String authorEmail = null;

        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            authorEmail = auth.getName();
            Optional<User> userOpt = userRepository.findByEmail(authorEmail);
            if (userOpt.isPresent()) {
                User u = userOpt.get();
                authorName = u.getName();
                authorRole = u.getRole() != null ? u.getRole().name() : "ROLE_SEEKER";
                authorCompany = u.getCompanyName();
            }
        }

        if (tipRequest.getTitle() == null || tipRequest.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Title is required");
        }
        if (tipRequest.getContent() == null || tipRequest.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Content is required");
        }

        CareerTip tip = new CareerTip();
        tip.setTitle(tipRequest.getTitle().trim());
        tip.setCategory(tipRequest.getCategory() != null ? tipRequest.getCategory().trim() : "General Advice");
        tip.setSummary(tipRequest.getSummary() != null ? tipRequest.getSummary().trim() : "");
        tip.setContent(tipRequest.getContent().trim());
        tip.setAuthorName(tipRequest.getAuthorName() != null && !tipRequest.getAuthorName().trim().isEmpty() ? tipRequest.getAuthorName().trim() : authorName);
        tip.setAuthorRole(tipRequest.getAuthorRole() != null ? tipRequest.getAuthorRole() : authorRole);
        tip.setAuthorCompany(authorCompany);
        tip.setAuthorEmail(authorEmail);
        tip.setLikesCount(0);
        tip.setCreatedAt(LocalDateTime.now());

        CareerTip saved = careerTipRepository.save(tip);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<?> likeTip(@PathVariable Long id) {
        Optional<CareerTip> opt = careerTipRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        CareerTip tip = opt.get();
        tip.setLikesCount(tip.getLikesCount() + 1);
        careerTipRepository.save(tip);
        return ResponseEntity.ok(tip);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(List.of(
                "Technical Interview Prep",
                "Resume & Portfolio",
                "Offer & Salary Negotiation",
                "System Design & Microservices",
                "Hiring Manager Insights",
                "Engineering Culture"
        ));
    }
}
