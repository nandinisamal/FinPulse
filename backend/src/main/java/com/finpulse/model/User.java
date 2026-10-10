package com.finpulse.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 5)
    private String currency = "₹";

    @NotNull
    @Column(name = "monthly_income_target", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyIncomeTarget = new BigDecimal("75000.00");

    @NotNull
    @Column(name = "savings_target_goal", nullable = false)
    private Integer savingsTargetGoal = 25;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String name, String email, String passwordHash, String currency, BigDecimal monthlyIncomeTarget, Integer savingsTargetGoal) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.currency = currency != null ? currency : "$";
        this.monthlyIncomeTarget = monthlyIncomeTarget != null ? monthlyIncomeTarget : new BigDecimal("5000.00");
        this.savingsTargetGoal = savingsTargetGoal != null ? savingsTargetGoal : 25;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getMonthlyIncomeTarget() { return monthlyIncomeTarget; }
    public void setMonthlyIncomeTarget(BigDecimal monthlyIncomeTarget) { this.monthlyIncomeTarget = monthlyIncomeTarget; }

    public Integer getSavingsTargetGoal() { return savingsTargetGoal; }
    public void setSavingsTargetGoal(Integer savingsTargetGoal) { this.savingsTargetGoal = savingsTargetGoal; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
