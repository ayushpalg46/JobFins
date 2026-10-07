package com.jobfins.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Recruiter updating the status of an application (e.g. ACCEPTED, REJECTED, SHORTLISTED).
 */
public class StatusUpdateRequest {

    @NotBlank(message = "Status cannot be empty")
    private String status;

    private String offerDetails;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(String status) {
        this.status = status;
    }

    public StatusUpdateRequest(String status, String offerDetails) {
        this.status = status;
        this.offerDetails = offerDetails;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOfferDetails() {
        return offerDetails;
    }

    public void setOfferDetails(String offerDetails) {
        this.offerDetails = offerDetails;
    }
}
