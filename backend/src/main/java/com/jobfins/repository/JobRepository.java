package com.jobfins.repository;

import com.jobfins.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JobRepository interface providing CRUD methods and search queries for Jobs.
 * Extends JpaRepository<Job, Long> (Experiment 5).
 */
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Find all jobs posted by a specific recruiter
    List<Job> findByRecruiterIdOrderByPostedDateDesc(Long recruiterId);

    // Find all jobs ordered by newest first
    List<Job> findAllByOrderByPostedDateDesc();

    // Search jobs by title, company, or location (case-insensitive)
    @Query("SELECT j FROM Job j WHERE " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.jobType) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY j.postedDate DESC")
    List<Job> searchJobs(@Param("keyword") String keyword);

    // Directly delete a job by ID via native query
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM jobs WHERE id = :jobId", nativeQuery = true)
    void deleteJobByIdNative(@Param("jobId") Long jobId);
}
