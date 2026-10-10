package com.finpulse.dto;

import java.math.BigDecimal;

public class AuthResponse {

    private Long id;
    private String name;
    private String email;
    private String currency;
    private BigDecimal monthlyIncomeTarget;
    private Integer savingsTargetGoal;
    private String message;

    public AuthResponse() {}

    public AuthResponse(Long id, String name, String email, String currency, BigDecimal monthlyIncomeTarget, Integer savingsTargetGoal, String message) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.currency = currency;
        this.monthlyIncomeTarget = monthlyIncomeTarget;
        this.savingsTargetGoal = savingsTargetGoal;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getMonthlyIncomeTarget() { return monthlyIncomeTarget; }
    public void setMonthlyIncomeTarget(BigDecimal monthlyIncomeTarget) { this.monthlyIncomeTarget = monthlyIncomeTarget; }

    public Integer getSavingsTargetGoal() { return savingsTargetGoal; }
    public void setSavingsTargetGoal(Integer savingsTargetGoal) { this.savingsTargetGoal = savingsTargetGoal; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
