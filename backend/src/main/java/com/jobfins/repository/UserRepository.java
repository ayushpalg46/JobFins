package com.jobfins.repository;

import com.jobfins.model.Role;
import com.jobfins.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository interface providing ready-to-use CRUD and query methods.
 * Extends JpaRepository<User, Long> (Experiment 5).
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email for authentication (Experiment 6)
    Optional<User> findByEmail(String email);

    // Check if email already registered
    boolean existsByEmail(String email);

    // Count users by role for dashboard statistics
    long countByRole(Role role);

    // Find all users by role (e.g. all registered job seekers for talent sourcing)
    java.util.List<User> findByRole(Role role);
}
