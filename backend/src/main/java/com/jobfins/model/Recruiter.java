package com.jobfins.model;

/**
 * Recruiter Entity representing an employer or hiring organization.
 * Encapsulates corporate profile, hiring preferences, and posted vacancies.
 */
public class Recruiter extends User {

    public Recruiter() {
        super();
        setRole(Role.ROLE_RECRUITER);
    }

    public Recruiter(String name, String email, String password, String companyName, String contactNumber) {
        super(name, email, password, Role.ROLE_RECRUITER, companyName, contactNumber, "Recruiter");
    }
}
