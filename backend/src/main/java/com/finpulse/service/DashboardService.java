package com.finpulse.service;

import com.finpulse.dto.DashboardSummaryDto;
import com.finpulse.model.Budget;
import com.finpulse.model.User;
import com.finpulse.repository.BudgetRepository;
import com.finpulse.repository.ExpenseRepository;
import com.finpulse.repository.IncomeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public DashboardService(IncomeRepository incomeRepository,
                            ExpenseRepository expenseRepository,
                            BudgetRepository budgetRepository) {
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
    }

    public DashboardSummaryDto getSummary(User user, YearMonth yearMonth) {
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        BigDecimal totalIncome = incomeRepository.sumIncomeByUserIdAndDateRange(user.getId(), start, end)
                .orElse(BigDecimal.ZERO);
        BigDecimal totalExpenses = expenseRepository.sumExpenseByUserIdAndDateRange(user.getId(), start, end)
                .orElse(BigDecimal.ZERO);
        BigDecimal availableBalance = totalIncome.subtract(totalExpenses);

        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0 && availableBalance.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = availableBalance.divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP);
        }

        boolean incomeTargetMet = totalIncome.compareTo(user.getMonthlyIncomeTarget()) >= 0;

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(user.getId(), yearMonth.toString());
        int overbudgetCount = 0;
        for (Budget b : budgets) {
            BigDecimal spent = expenseRepository.sumByCategoryAndDateRange(user.getId(), b.getCategory(), start, end)
                    .orElse(BigDecimal.ZERO);
            if (spent.compareTo(b.getLimitAmount()) > 0) {
                overbudgetCount++;
            }
        }

        return new DashboardSummaryDto(
                totalIncome,
                totalExpenses,
                availableBalance,
                savingsRate,
                user.getSavingsTargetGoal(),
                incomeTargetMet,
                budgets.size(),
                overbudgetCount
        );
    }
}
