package com.jobfins.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * OfferLetter Entity representing a formal in-platform digital offer letter.
 * Maps to the "offer_letters" table in MySQL (JobFins Core USP).
 */
@Entity
@Table(name = "offer_letters")
public class OfferLetter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    @JsonIgnore
    private Application application;

    private String baseSalary;          // e.g. "₹18,00,000 / annum"

    private String performanceBonus;    // e.g. "₹2,00,000 annual variable"

    private String stockOptions;        // e.g. "0.05% Equity (ESOPs)"

    private String joiningDate;         // e.g. "2026-11-01"

    private String reportingManager;    // e.g. "Engineering Director"

    private String acceptanceSla;       // e.g. "Within 7 Days"

    @Column(nullable = false)
    private String status = "ISSUED";   // ISSUED, ACCEPTED, DECLINED

    @Column(columnDefinition = "TEXT")
    private String termsAndConditions;

    private LocalDateTime issuedDate;

    public OfferLetter() {
    }

    public OfferLetter(Application application, String baseSalary, String performanceBonus, String stockOptions, String joiningDate, String reportingManager, String acceptanceSla) {
        this.application = application;
        this.baseSalary = baseSalary;
        this.performanceBonus = performanceBonus;
        this.stockOptions = stockOptions;
        this.joiningDate = joiningDate;
        this.reportingManager = reportingManager;
        this.acceptanceSla = acceptanceSla;
        this.status = "ISSUED";
    }

    @PrePersist
    public void onPrePersist() {
        if (this.issuedDate == null) {
            this.issuedDate = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public String getBaseSalary() {
        return baseSalary;
    }

    public void setBaseSalary(String baseSalary) {
        this.baseSalary = baseSalary;
    }

    public String getPerformanceBonus() {
        return performanceBonus;
    }

    public void setPerformanceBonus(String performanceBonus) {
        this.performanceBonus = performanceBonus;
    }

    public String getStockOptions() {
        return stockOptions;
    }

    public void setStockOptions(String stockOptions) {
        this.stockOptions = stockOptions;
    }

    public String getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(String joiningDate) {
        this.joiningDate = joiningDate;
    }

    public String getReportingManager() {
        return reportingManager;
    }

    public void setReportingManager(String reportingManager) {
        this.reportingManager = reportingManager;
    }

    public String getAcceptanceSla() {
        return acceptanceSla;
    }

    public void setAcceptanceSla(String acceptanceSla) {
        this.acceptanceSla = acceptanceSla;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTermsAndConditions() {
        return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
        this.termsAndConditions = termsAndConditions;
    }

    public LocalDateTime getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDateTime issuedDate) {
        this.issuedDate = issuedDate;
    }
}
