package com.jobfins.model;

/**
 * Candidate Entity representing a job seeker / applicant.
 * Encapsulates candidate profile, resume credentials, technical skills, and applications.
 */
public class Candidate extends User {

    public Candidate() {
        super();
        setRole(Role.ROLE_SEEKER);
    }

    public Candidate(String name, String email, String password, String contactNumber, String bioOrSkills) {
        super(name, email, password, Role.ROLE_SEEKER, null, contactNumber, bioOrSkills);
    }
}
