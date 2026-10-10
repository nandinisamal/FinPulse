package com.finpulse.dto;

import java.math.BigDecimal;

public class DashboardSummaryDto {

    private BigDecimal totalMonthlyIncome;
    private BigDecimal totalMonthlyExpenses;
    private BigDecimal availableBalance;
    private BigDecimal savingsRate;
    private Integer targetSavingsRate;
    private boolean incomeTargetMet;
    private int activeBudgetsCount;
    private int overbudgetCount;

    public DashboardSummaryDto() {}

    public DashboardSummaryDto(BigDecimal totalMonthlyIncome, BigDecimal totalMonthlyExpenses, BigDecimal availableBalance, BigDecimal savingsRate, Integer targetSavingsRate, boolean incomeTargetMet, int activeBudgetsCount, int overbudgetCount) {
        this.totalMonthlyIncome = totalMonthlyIncome;
        this.totalMonthlyExpenses = totalMonthlyExpenses;
        this.availableBalance = availableBalance;
        this.savingsRate = savingsRate;
        this.targetSavingsRate = targetSavingsRate;
        this.incomeTargetMet = incomeTargetMet;
        this.activeBudgetsCount = activeBudgetsCount;
        this.overbudgetCount = overbudgetCount;
    }

    public BigDecimal getTotalMonthlyIncome() { return totalMonthlyIncome; }
    public void setTotalMonthlyIncome(BigDecimal totalMonthlyIncome) { this.totalMonthlyIncome = totalMonthlyIncome; }

    public BigDecimal getTotalMonthlyExpenses() { return totalMonthlyExpenses; }
    public void setTotalMonthlyExpenses(BigDecimal totalMonthlyExpenses) { this.totalMonthlyExpenses = totalMonthlyExpenses; }

    public BigDecimal getAvailableBalance() { return availableBalance; }
    public void setAvailableBalance(BigDecimal availableBalance) { this.availableBalance = availableBalance; }

    public BigDecimal getSavingsRate() { return savingsRate; }
    public void setSavingsRate(BigDecimal savingsRate) { this.savingsRate = savingsRate; }

    public Integer getTargetSavingsRate() { return targetSavingsRate; }
    public void setTargetSavingsRate(Integer targetSavingsRate) { this.targetSavingsRate = targetSavingsRate; }

    public boolean isIncomeTargetMet() { return incomeTargetMet; }
    public void setIncomeTargetMet(boolean incomeTargetMet) { this.incomeTargetMet = incomeTargetMet; }

    public int getActiveBudgetsCount() { return activeBudgetsCount; }
    public void setActiveBudgetsCount(int activeBudgetsCount) { this.activeBudgetsCount = activeBudgetsCount; }

    public int getOverbudgetCount() { return overbudgetCount; }
    public void setOverbudgetCount(int overbudgetCount) { this.overbudgetCount = overbudgetCount; }
}
