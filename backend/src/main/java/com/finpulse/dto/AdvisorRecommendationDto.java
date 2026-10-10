package com.finpulse.dto;

import java.math.BigDecimal;

public class AdvisorRecommendationDto {

    private String id;
    private String type; // critical, warning, positive, tip
    private String title;
    private String message;
    private String reason;
    private String suggestedAction;
    private BigDecimal potentialSavings;

    public AdvisorRecommendationDto() {}

    public AdvisorRecommendationDto(String id, String type, String title, String message, String reason, String suggestedAction, BigDecimal potentialSavings) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.reason = reason;
        this.suggestedAction = suggestedAction;
        this.potentialSavings = potentialSavings;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getSuggestedAction() { return suggestedAction; }
    public void setSuggestedAction(String suggestedAction) { this.suggestedAction = suggestedAction; }

    public BigDecimal getPotentialSavings() { return potentialSavings; }
    public void setPotentialSavings(BigDecimal potentialSavings) { this.potentialSavings = potentialSavings; }
}
