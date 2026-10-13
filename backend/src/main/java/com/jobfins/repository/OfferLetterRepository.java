package com.jobfins.repository;

import com.jobfins.model.OfferLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OfferLetterRepository extends JpaRepository<OfferLetter, Long> {
    Optional<OfferLetter> findByApplicationId(Long applicationId);
}
