package com.jobfins.config;

import com.jobfins.model.CareerTip;
import com.jobfins.model.Job;
import com.jobfins.model.Role;
import com.jobfins.model.User;
import com.jobfins.repository.CareerTipRepository;
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
    private CareerTipRepository careerTipRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            log.info("Checking database initialization for JobFins...");

            // 1. Create Recruiter Account
            if (userRepository.findByEmail("recruiter@jobfins.com").isEmpty()) {
                User recruiter = new User();
                recruiter.setName("TechCorp Recruiter");
                recruiter.setEmail("recruiter@jobfins.com");
                recruiter.setPassword(passwordEncoder.encode("password123"));
                recruiter.setRole(Role.ROLE_RECRUITER);
                recruiter.setCompanyName("TechCorp Innovations");
                recruiter.setContactNumber("+91 9876543210");
                recruiter.setBioOrSkills("Technical Talent Acquisition Lead");
                userRepository.save(recruiter);
            }

            User recruiter = userRepository.findByEmail("recruiter@jobfins.com").orElse(null);

            // 2. Create Seeker Accounts (Diverse Demo Candidates for Talent Sourcing)
            seedSeekerIfMissing("Ayush Pal", "seeker@jobfins.com", "+91 9123456780", "Senior Full Stack Java Lead | Spring Boot, React, Docker, PostgreSQL, Microservices");
            seedSeekerIfMissing("Maya Chen", "maya.chen@example.com", "+91 9823411223", "Staff Backend Architect | FastAPI, Python, Go, Docker, Kubernetes, PostgreSQL");
            seedSeekerIfMissing("Elena Rostova", "elena.rostova@example.com", "+91 9711223344", "Senior Cloud & DevOps SRE | Kubernetes, Docker, Terraform, Rust, Linux, AWS");
            seedSeekerIfMissing("Rahul Sharma", "rahul.sharma@example.com", "+91 9812345678", "Java Backend Engineer II | Spring Boot, Java 17, MySQL, Redis, Kafka");
            seedSeekerIfMissing("Sneha Kapoor", "sneha.kapoor@example.com", "+91 9988776655", "Lead Mobile & Frontend Engineer | React, Flutter, Next.js, TypeScript, Node.js");
            seedSeekerIfMissing("Vikramaditya Roy", "vikram.roy@example.com", "+91 9876501234", "High-Throughput Systems Engineer | Rust, Go, gRPC, Cassandra, Docker, Kafka");
            seedSeekerIfMissing("Ananya Deshmukh", "ananya.d@example.com", "+91 9123478901", "Full Stack Python & React Engineer | Django, FastAPI, React, PostgreSQL, Celery");
            seedSeekerIfMissing("Karthik Venkat", "karthik.v@example.com", "+91 9445566778", "Senior Microservices Architect | Java 21, Spring Boot, AWS, Kafka, DynamoDB");
            seedSeekerIfMissing("Rohan Verma", "rohan.verma@example.com", "+91 9789012345", "Cloud Native Platform Engineer | Docker, Kubernetes, Helm, Go, GCP, Terraform");
            seedSeekerIfMissing("Zoya Al-Mansoor", "zoya.tech@example.com", "+91 9654321098", "Frontend Performance Specialist | Next.js, React, Tailwind, GraphQL, Vite");

            // 3. Create Sample Jobs
            if (jobRepository.count() == 0 && recruiter != null) {
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
            }

            // 4. Create Initial Career Tips (Authored by both Recruiter and Candidate)
            if (careerTipRepository.count() < 4) {
                // Recruiter Post 1
                CareerTip tip1 = new CareerTip(
                        "What Engineering Leaders Look For in Full Stack Take-Homes",
                        "Hiring Manager Insights",
                        "Advice from tech recruiting leads on passing codebase evaluations with flying colors.",
                        "1. Write clear unit and integration tests with Mockito & JUnit.\n2. Provide a 1-click Dockerfile or live deployed URL on Render/Vercel.\n3. Keep architecture clean with strict separation of concerns between Controller, Service, and Repository layers.\n4. Document environment variables clearly in a README.md.",
                        "TechCorp Recruiter",
                        "ROLE_RECRUITER",
                        "TechCorp Innovations",
                        "recruiter@jobfins.com"
                );
                tip1.setLikesCount(32);
                careerTipRepository.save(tip1);

                // Candidate Post 1
                CareerTip tip2 = new CareerTip(
                        "How I Prepared for Spring Boot 3 & Microservice Interviews in 30 Days",
                        "Technical Interview Prep",
                        "A candidate's hands-on roadmap to mastering Java 17+, Hibernate, and RESTful APIs.",
                        "Focus on hands-on project proof rather than memorizing theory:\n• Day 1-10: Deep dive into Spring IoC lifecycle, @Transactional propagation, and Bean scopes.\n• Day 11-20: Build microservices with Spring Cloud Gateway, OpenFeign, and Resilience4j.\n• Day 21-30: Performance tuning: Connection pooling (HikariCP), JPA N+1 query elimination, and Docker deployments.",
                        "Ayush Pal",
                        "ROLE_SEEKER",
                        null,
                        "seeker@jobfins.com"
                );
                tip2.setLikesCount(45);
                careerTipRepository.save(tip2);

                // Recruiter Post 2
                CareerTip tip3 = new CareerTip(
                        "The #1 Mistake Engineers Make in Offer & Salary Negotiations",
                        "Offer & Salary Negotiation",
                        "Senior Talent Partner perspective on navigating counter-offers and total compensation.",
                        "• Always negotiate based on market value and verified proof of work, not personal financial needs.\n• Look at the whole picture: Base salary, joining bonus, performance incentives, ESOPs/equity vesting, and remote allowances.\n• Communicate enthusiastically: 'I am excited about this mission and want to make this work. Given my stack capability, can we adjust base pay to ₹18 LPA?'",
                        "Priya Singhania",
                        "ROLE_RECRUITER",
                        "Nexus Talent Global",
                        "priya.recruiter@nexustech.io"
                );
                tip3.setLikesCount(28);
                careerTipRepository.save(tip3);

                // Candidate Post 2
                CareerTip tip4 = new CareerTip(
                        "From 0 Replies to 4 SDE Offers: My Proof-Over-Paper Strategy",
                        "Resume & Portfolio",
                        "Why replacing generic PDF buzzwords with live production demos 10x'd my callback rate.",
                        "1. Instead of 'Worked with React & Spring', write: 'Designed Spring Boot backend processing 2k TPS with React frontend, deployed at myapp.vercel.app'.\n2. Include your GitHub repo directly in your application with a detailed architecture diagram.\n3. Recruiters test working links in under 60 seconds — make sure your live demo has zero CORS errors!",
                        "Maya Chen",
                        "ROLE_SEEKER",
                        null,
                        "maya.chen@example.com"
                );
                tip4.setLikesCount(56);
                careerTipRepository.save(tip4);

                // Recruiter Post 3
                CareerTip tip5 = new CareerTip(
                        "Cracking System Design: How We Evaluate Database & Caching Choices",
                        "System Design & Microservices",
                        "What senior interviewers look for when asking you to design a high-throughput platform.",
                        "• Clarify functional vs non-functional requirements (read-heavy vs write-heavy, latency SLA, consistency vs availability).\n• Choose appropriate storage: PostgreSQL/MySQL for ACID financial ledger; Redis for caching hot data and session rate-limiting.\n• Don't jump straight into microservices if a modular monolith solves the throughput requirements with less network overhead.",
                        "Arjun Mehta",
                        "ROLE_RECRUITER",
                        "FinScale Cloud Systems",
                        "arjun.vp@finscale.dev"
                );
                tip5.setLikesCount(39);
                careerTipRepository.save(tip5);

                // Candidate Post 3
                CareerTip tip6 = new CareerTip(
                        "5 Docker & CI/CD Concepts That Won Me My Cloud DevOps Role",
                        "Engineering Culture",
                        "Practical DevOps tips every backend and full stack engineer should practice.",
                        "1. Multi-stage Docker builds to reduce container image sizes from 600MB to 80MB.\n2. Non-root user permissions inside Docker containers for security compliance.\n3. Health checks (`HEALTHCHECK --interval=30s`) so container orchestrators know when Spring Boot is ready.\n4. GitHub Actions workflow for automated compile, test, and container push on every PR.",
                        "Elena Rostova",
                        "ROLE_SEEKER",
                        null,
                        "elena.rostova@example.com"
                );
                tip6.setLikesCount(41);
                careerTipRepository.save(tip6);
            }

            log.info("Sample database initialization completed successfully.");
        } catch (Exception e) {
            log.warn("Data initialization encountered an error: {}", e.getMessage());
        }
    }

    private void seedSeekerIfMissing(String name, String email, String phone, String bio) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User seeker = new User();
            seeker.setName(name);
            seeker.setEmail(email);
            seeker.setPassword(passwordEncoder.encode("password123"));
            seeker.setRole(Role.ROLE_SEEKER);
            seeker.setContactNumber(phone);
            seeker.setBioOrSkills(bio);
            userRepository.save(seeker);
        }
    }
}
