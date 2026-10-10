package com.finpulse.dto;

import com.finpulse.model.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class BudgetDto {

    @NotNull(message = "Category is required")
    private ExpenseCategory category;

    @NotNull(message = "Limit amount is required")
    @DecimalMin(value = "1.00", message = "Limit must be at least 1.00")
    private BigDecimal limitAmount;

    @NotBlank(message = "Month-Year is required (YYYY-MM)")
    private String monthYear;

    public BudgetDto() {}

    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory category) { this.category = category; }

    public BigDecimal getLimitAmount() { return limitAmount; }
    public void setLimitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; }

    public String getMonthYear() { return monthYear; }
    public void setMonthYear(String monthYear) { this.monthYear = monthYear; }
}
