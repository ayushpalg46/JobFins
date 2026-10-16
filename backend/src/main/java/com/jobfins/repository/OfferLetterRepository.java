package com.jobfins.repository;

import com.jobfins.model.OfferLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface OfferLetterRepository extends JpaRepository<OfferLetter, Long> {
    Optional<OfferLetter> findByApplicationId(Long applicationId);

    // Cascading delete: delete all offer letters for applications linked to a specific job ID
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM offer_letters WHERE application_id IN (SELECT id FROM applications WHERE job_id = :jobId)", nativeQuery = true)
    void deleteByJobId(@Param("jobId") Long jobId);
}
