package com.jobfins.config;

import com.jobfins.model.*;
import com.jobfins.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataInitializer seeds initial roles, companies, recruiters, seekers, jobs,
 * applications, offer letters, and career tips on application start.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private OfferLetterRepository offerLetterRepository;

    @Autowired
    private CareerTipRepository careerTipRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            log.info("Checking database initialization across all 7 entities for JobFins...");

            // 1. Seed Roles Table
            RoleEntity roleSeeker = roleRepository.findByRoleName("ROLE_SEEKER")
                    .orElseGet(() -> roleRepository.save(new RoleEntity("ROLE_SEEKER", "Candidate with proof of work and application privileges")));

            RoleEntity roleRecruiter = roleRepository.findByRoleName("ROLE_RECRUITER")
                    .orElseGet(() -> roleRepository.save(new RoleEntity("ROLE_RECRUITER", "Enterprise Recruiter with verified hiring and offer generation rights")));

            // Determine environment: Docker vs Render vs Local
            boolean isRender = "true".equalsIgnoreCase(System.getenv("RENDER"));
            boolean isDocker = !isRender && (
                    "true".equalsIgnoreCase(System.getenv("DOCKER_DEMO_ACCOUNTS"))
                    || "true".equalsIgnoreCase(System.getenv("DOCKER_ENVIRONMENT"))
                    || (System.getenv("SPRING_DATASOURCE_URL") != null && System.getenv("SPRING_DATASOURCE_URL").contains("mysqldb"))
            );

            String recruiterEmail = isDocker ? "recruiter@gmail.com" : "recruiter@jobfins.com";
            String recruiterPassword = isDocker ? "qwerty123" : "password123";

            String seekerEmail = isDocker ? "candidate@gmail.com.com" : "seeker@jobfins.com";
            String seekerPassword = isDocker ? "qwerty123" : "password123";

            // If running in Docker and existing records from previous volume run exist, migrate them to new credentials
            if (isDocker) {
                userRepository.findByEmail("recruiter@jobfins.com").ifPresent(oldRec -> {
                    if (userRepository.findByEmail("recruiter@gmail.com").isEmpty()) {
                        oldRec.setEmail("recruiter@gmail.com");
                        oldRec.setPassword(passwordEncoder.encode("qwerty123"));
                        userRepository.save(oldRec);
                    }
                });
                userRepository.findByEmail("seeker@jobfins.com").ifPresent(oldSeeker -> {
                    if (userRepository.findByEmail("candidate@gmail.com.com").isEmpty()) {
                        oldSeeker.setEmail("candidate@gmail.com.com");
                        oldSeeker.setPassword(passwordEncoder.encode("qwerty123"));
                        userRepository.save(oldSeeker);
                    }
                });
            }

            // 2. Create Recruiter Account
            if (userRepository.findByEmail(recruiterEmail).isEmpty()) {
                User recruiter = new User();
                recruiter.setName("TechCorp Recruiter");
                recruiter.setEmail(recruiterEmail);
                recruiter.setPassword(passwordEncoder.encode(recruiterPassword));
                recruiter.setRole(Role.ROLE_RECRUITER);
                recruiter.setRoleEntity(roleRecruiter);
                recruiter.setCompanyName("TechCorp Innovations");
                recruiter.setCompanyWebsite("https://techcorp-innovations.com");
                recruiter.setCompanyDescription("Leading enterprise cloud & software engineering firm.");
                recruiter.setContactNumber("+91 9876543210");
                recruiter.setLocation("Bangalore, Karnataka");
                recruiter.setBioOrSkills("Technical Talent Acquisition Lead");
                userRepository.save(recruiter);
            }

            User recruiter = userRepository.findByEmail(recruiterEmail).orElse(null);

            // 3. Seed Companies Table
            Company techCorp = companyRepository.findFirstByCompanyName("TechCorp Innovations")
                    .orElseGet(() -> {
                        Company c = new Company(
                                "TechCorp Innovations",
                                "https://techcorp-innovations.com",
                                "Pioneering cloud-native microservices architecture, enterprise analytics, and modern web applications.",
                                "Bangalore, Karnataka",
                                "Within 24-48 Hours",
                                recruiter
                        );
                        c.setRating(4.8);
                        c.setOpenPositions(8);
                        c.setIsVerified(true);
                        return companyRepository.save(c);
                    });

            if (companyRepository.findFirstByCompanyName("FinPay Solutions").isEmpty()) {
                Company finpay = new Company(
                        "FinPay Solutions",
                        "https://finpay-solutions.com",
                        "Next-generation digital ledger management and financial infrastructure.",
                        "Mumbai, Maharashtra",
                        "<24h Guaranteed",
                        null
                );
                finpay.setRating(4.9);
                finpay.setOpenPositions(6);
                finpay.setIsVerified(true);
                companyRepository.save(finpay);
            }

            if (companyRepository.findFirstByCompanyName("CloudScale Technologies").isEmpty()) {
                Company cloudscale = new Company(
                        "CloudScale Technologies",
                        "https://cloudscale.io",
                        "Automating container orchestration, continuous deployment, and cloud infrastructure.",
                        "Pune / Remote",
                        "Within 48 Hours",
                        null
                );
                cloudscale.setRating(4.7);
                cloudscale.setOpenPositions(5);
                cloudscale.setIsVerified(true);
                companyRepository.save(cloudscale);
            }

            // 4. Create Seeker Accounts (Diverse Demo Candidates for Talent Sourcing)
            if (isDocker) {
                seedSeekerIfMissing("Candidate Seeker", "candidate@gmail.com.com", "+91 9123456780", "Senior Full Stack Java Lead | Spring Boot, React, Docker, PostgreSQL, Microservices", roleSeeker, seekerPassword);
                seedSeekerIfMissing("Candidate Seeker", "candidate@gmail.com", "+91 9123456780", "Senior Full Stack Java Lead | Spring Boot, React, Docker, PostgreSQL, Microservices", roleSeeker, seekerPassword);
            } else {
                seedSeekerIfMissing("Ayush Pal", "seeker@jobfins.com", "+91 9123456780", "Senior Full Stack Java Lead | Spring Boot, React, Docker, PostgreSQL, Microservices", roleSeeker, seekerPassword);
            }
            seedSeekerIfMissing("Maya Chen", "maya.chen@example.com", "+91 9823411223", "Staff Backend Architect | FastAPI, Python, Go, Docker, Kubernetes, PostgreSQL", roleSeeker);
            seedSeekerIfMissing("Elena Rostova", "elena.rostova@example.com", "+91 9711223344", "Senior Cloud & DevOps SRE | Kubernetes, Docker, Terraform, Rust, Linux, AWS", roleSeeker);
            seedSeekerIfMissing("Rahul Sharma", "rahul.sharma@example.com", "+91 9812345678", "Java Backend Engineer II | Spring Boot, Java 17, MySQL, Redis, Kafka", roleSeeker);
            seedSeekerIfMissing("Sneha Kapoor", "sneha.kapoor@example.com", "+91 9988776655", "Lead Mobile & Frontend Engineer | React, Flutter, Next.js, TypeScript, Node.js", roleSeeker);

            User mainSeeker = userRepository.findByEmail(seekerEmail).orElseGet(() ->
                    userRepository.findByEmail("candidate@gmail.com").orElse(null)
            );

            // 5. Create Sample Jobs (Linked to Recruiter and Company)
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
                job1.setCompanyEntity(techCorp);
                jobRepository.save(job1);

                Job job2 = new Job(
                        "Full Stack Java Engineer",
                        "TechCorp Innovations",
                        "Mumbai / Hybrid",
                        "Full-time",
                        "₹15 - 22 LPA",
                        "Develop modern responsive web applications using React.js frontend and Spring Boot backend.",
                        "React.js, Java, Spring Security, Hibernate, Vite",
                        recruiter
                );
                job2.setCompanyEntity(techCorp);
                jobRepository.save(job2);
            }

            // 6. Seed Sample Application & Offer Letter (Core USP)
            Job sampleJob = jobRepository.findAll().stream().findFirst().orElse(null);
            if (sampleJob != null && mainSeeker != null && applicationRepository.count() == 0) {
                Application sampleApp = new Application(
                        sampleJob,
                        mainSeeker,
                        "Excited to apply with full stack expertise in Spring Boot and React.",
                        "https://github.com/ayushpalg46/JobFins"
                );
                sampleApp.setStatus("ACCEPTED");
                sampleApp.setAtsScore(96);
                sampleApp.setAtsStatus("HIGH_MATCH");
                sampleApp.setAtsKeywordsMatched("Java 17, Spring Boot, MySQL, REST API, Microservices");
                sampleApp.setBaseSalary("₹18,00,000 / annum");
                sampleApp.setPerformanceBonus("₹2,00,000 annual variable");
                sampleApp.setStockOptions("₹6,00,000 ESOPs (4 yr vesting)");
                sampleApp.setJoiningDate("2026-11-01");
                sampleApp.setReportingManager("Engineering Director");
                sampleApp.setAcceptanceDeadline("Within 7 Days");
                String offerJson = "{\"offerId\":\"JOBFIN-OFFER-1024\",\"candidateName\":\"Ayush Pal\",\"role\":\"Java Backend Developer\",\"department\":\"Core Engineering & Cloud Scale\",\"joiningDate\":\"2026-11-01\",\"baseSalary\":1800000,\"bonus\":200000,\"esops\":600000,\"joiningBonus\":100000,\"totalFirstYearCtc\":2250000,\"acceptanceDeadline\":\"7 Days\"}";
                sampleApp.setOfferDetails(offerJson);
                Application savedApp = applicationRepository.save(sampleApp);

                // Seed OfferLetter Entity
                OfferLetter offerLetter = new OfferLetter(
                        savedApp,
                        "₹18,00,000 / annum",
                        "₹2,00,000 annual variable",
                        "₹6,00,000 ESOPs (4 yr vesting)",
                        "2026-11-01",
                        "Engineering Director",
                        "Within 7 Days"
                );
                offerLetter.setTermsAndConditions(offerJson);
                offerLetter.setStatus("ISSUED");
                offerLetterRepository.save(offerLetter);
            }

            // 7. Create Initial Career Tips (Authored by Recruiter & Candidate)
            if (careerTipRepository.count() < 4) {
                CareerTip tip1 = new CareerTip(
                        "What Engineering Leaders Look For in Full Stack Take-Homes",
                        "Hiring Manager Insights",
                        "Advice from tech recruiting leads on passing codebase evaluations with flying colors.",
                        "1. Write clear unit and integration tests with Mockito & JUnit.\n2. Provide a 1-click Dockerfile or live deployed URL on Render/Vercel.\n3. Keep architecture clean with strict separation of concerns between Controller, Service, and Repository layers.\n4. Document environment variables clearly in a README.md.",
                        "TechCorp Recruiter",
                        "ROLE_RECRUITER",
                        "TechCorp Innovations",
                        recruiterEmail
                );
                tip1.setAuthorUser(recruiter);
                tip1.setLikesCount(32);
                careerTipRepository.save(tip1);

                CareerTip tip2 = new CareerTip(
                        "How I Prepared for Spring Boot 3 & Microservice Interviews in 30 Days",
                        "Technical Interview Prep",
                        "A candidate's hands-on roadmap to mastering Java 17+, Hibernate, and RESTful APIs.",
                        "Focus on hands-on project proof rather than memorizing theory:\n• Day 1-10: Deep dive into Spring IoC lifecycle, @Transactional propagation, and Bean scopes.\n• Day 11-20: Build microservices with Spring Cloud Gateway, OpenFeign, and Resilience4j.\n• Day 21-30: Performance tuning: Connection pooling (HikariCP), JPA N+1 query elimination, and Docker deployments.",
                        "Ayush Pal",
                        "ROLE_SEEKER",
                        null,
                        seekerEmail
                );
                tip2.setAuthorUser(mainSeeker);
                tip2.setLikesCount(45);
                careerTipRepository.save(tip2);

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
            }

            log.info("JobFins database initialization across all 7 entities completed successfully.");
        } catch (Exception e) {
            log.warn("Data initialization encountered an error: {}", e.getMessage());
        }
    }

    private void seedSeekerIfMissing(String name, String email, String phone, String bio, RoleEntity roleSeeker) {
        seedSeekerIfMissing(name, email, phone, bio, roleSeeker, "password123");
    }

    private void seedSeekerIfMissing(String name, String email, String phone, String bio, RoleEntity roleSeeker, String rawPassword) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User seeker = new User();
            seeker.setName(name);
            seeker.setEmail(email);
            seeker.setPassword(passwordEncoder.encode(rawPassword));
            seeker.setRole(Role.ROLE_SEEKER);
            seeker.setRoleEntity(roleSeeker);
            seeker.setContactNumber(phone);
            seeker.setBioOrSkills(bio);
            userRepository.save(seeker);
        }
    }
}
