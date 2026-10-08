package com.jobfins.config;

import com.jobfins.model.Job;
import com.jobfins.model.Role;
import com.jobfins.model.User;
import com.jobfins.repository.JobRepository;
import com.jobfins.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataInitializer seeds initial recruiters, seekers, and sample jobs
 * on application start if database is empty.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            if (userRepository.count() == 0) {
                log.info("Database is empty. Initializing sample recruiter, seeker, and jobs...");

                // 1. Create Recruiter Account
                User recruiter = new User();
                recruiter.setName("TechCorp Recruiter");
                recruiter.setEmail("recruiter@jobfins.com");
                recruiter.setPassword(passwordEncoder.encode("password123"));
                recruiter.setRole(Role.ROLE_RECRUITER);
                recruiter.setCompanyName("TechCorp Innovations");
                recruiter.setContactNumber("+91 9876543210");
                recruiter.setBioOrSkills("Technical Talent Acquisition Lead");
                userRepository.save(recruiter);

                // 2. Create Seeker Accounts
                User seeker = new User();
                seeker.setName("Ayush Pal");
                seeker.setEmail("seeker@jobfins.com");
                seeker.setPassword(passwordEncoder.encode("password123"));
                seeker.setRole(Role.ROLE_SEEKER);
                seeker.setContactNumber("+91 9123456780");
                seeker.setBioOrSkills("Full Stack Java Developer | Spring Boot, React, Docker, PostgreSQL");
                userRepository.save(seeker);

                User seeker2 = new User();
                seeker2.setName("Maya Chen");
                seeker2.setEmail("maya.chen@example.com");
                seeker2.setPassword(passwordEncoder.encode("password123"));
                seeker2.setRole(Role.ROLE_SEEKER);
                seeker2.setContactNumber("+91 9823411223");
                seeker2.setBioOrSkills("Backend Architect | FastAPI, Python, Go, Docker, Kubernetes, PostgreSQL");
                userRepository.save(seeker2);

                User seeker3 = new User();
                seeker3.setName("Elena Rostova");
                seeker3.setEmail("elena.rostova@example.com");
                seeker3.setPassword(passwordEncoder.encode("password123"));
                seeker3.setRole(Role.ROLE_SEEKER);
                seeker3.setContactNumber("+91 9711223344");
                seeker3.setBioOrSkills("Cloud & DevOps SRE | Kubernetes, Docker, Terraform, Rust, Linux");
                userRepository.save(seeker3);

                User seeker4 = new User();
                seeker4.setName("Rahul Sharma");
                seeker4.setEmail("rahul.sharma@example.com");
                seeker4.setPassword(passwordEncoder.encode("password123"));
                seeker4.setRole(Role.ROLE_SEEKER);
                seeker4.setContactNumber("+91 9812345678");
                seeker4.setBioOrSkills("Java Backend Engineer | Spring Boot, Java 17, MySQL, Docker");
                userRepository.save(seeker4);

                User seeker5 = new User();
                seeker5.setName("Sneha Kapoor");
                seeker5.setEmail("sneha.kapoor@example.com");
                seeker5.setPassword(passwordEncoder.encode("password123"));
                seeker5.setRole(Role.ROLE_SEEKER);
                seeker5.setContactNumber("+91 9988776655");
                seeker5.setBioOrSkills("Frontend & Mobile Engineer | React, Flutter, Next.js, Node.js");
                userRepository.save(seeker5);

                // 3. Create Sample Jobs
                Job job1 = new Job(
                        "Java Backend Developer",
                        "TechCorp Innovations",
                        "Bangalore, India",
                        "Full-time",
                        "₹12 - 18 LPA",
                        "Build high-performance REST APIs and microservices using Java 17, Spring Boot, and MySQL.",
                        "Java 17, Spring Boot, MySQL, REST APIs, Docker",
                        recruiter
                );
                jobRepository.save(job1);

                Job job2 = new Job(
                        "Full Stack Java Engineer",
                        "InnoWave Systems",
                        "Mumbai / Hybrid",
                        "Full-time",
                        "₹15 - 22 LPA",
                        "Develop modern responsive web applications using React.js frontend and Spring Boot backend.",
                        "React.js, Java, Spring Security, Hibernate, Vite",
                        recruiter
                );
                jobRepository.save(job2);

                log.info("Sample database initialization completed successfully.");
            }
        } catch (Exception e) {
            log.warn("Data initialization encountered an error: {}", e.getMessage());
        }
    }
}
