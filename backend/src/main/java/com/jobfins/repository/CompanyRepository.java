package com.jobfins.repository;

import com.jobfins.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findFirstByCompanyName(String companyName);
    Optional<Company> findByCompanyName(String companyName);
    Optional<Company> findFirstByRecruiterId(Long recruiterId);
    Optional<Company> findByRecruiterId(Long recruiterId);
}
