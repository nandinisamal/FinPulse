package com.finpulse.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class RegisterRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String currency = "$";
    private BigDecimal monthlyIncomeTarget = new BigDecimal("5000.00");
    private Integer savingsTargetGoal = 25;

    public RegisterRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getMonthlyIncomeTarget() { return monthlyIncomeTarget; }
    public void setMonthlyIncomeTarget(BigDecimal monthlyIncomeTarget) { this.monthlyIncomeTarget = monthlyIncomeTarget; }

    public Integer getSavingsTargetGoal() { return savingsTargetGoal; }
    public void setSavingsTargetGoal(Integer savingsTargetGoal) { this.savingsTargetGoal = savingsTargetGoal; }
}
