package com.finpulse.service;

import com.finpulse.dto.AdvisorRecommendationDto;
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
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class FinanceAdvisorService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public FinanceAdvisorService(IncomeRepository incomeRepository,
                                 ExpenseRepository expenseRepository,
                                 BudgetRepository budgetRepository) {
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
    }

    public List<AdvisorRecommendationDto> evaluateFinancialHealth(User user, YearMonth yearMonth) {
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        BigDecimal totalIncome = incomeRepository.sumIncomeByUserIdAndDateRange(user.getId(), start, end)
                .orElse(BigDecimal.ZERO);
        BigDecimal totalExpense = expenseRepository.sumExpenseByUserIdAndDateRange(user.getId(), start, end)
                .orElse(BigDecimal.ZERO);

        List<AdvisorRecommendationDto> list = new ArrayList<>();

        // 1. Missing Income Trigger
        if (totalIncome.compareTo(BigDecimal.ZERO) == 0) {
            list.add(new AdvisorRecommendationDto(
                "MISSING_INCOME", "warning", "Missing Monthly Income Record",
                "No income logged for cycle " + yearMonth + ". Please record your earnings to enable cashflow heuristics.",
                "Rule: Cashflow and savings analysis require an established baseline inflow.",
                "Navigate to the Income module and record this month's salary or client invoice.",
                null
            ));
        }

        // 2. Monthly Deficit Warning
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0 && totalExpense.compareTo(totalIncome) > 0) {
            BigDecimal deficit = totalExpense.subtract(totalIncome);
            list.add(new AdvisorRecommendationDto(
                "DEFICIT_WARNING", "critical", "Negative Cashflow Alert (Deficit)",
                "Monthly expenses (" + user.getCurrency() + totalExpense + ") exceed income (" + user.getCurrency() + totalIncome + ") by " + user.getCurrency() + deficit + ".",
                "Rule: Chronic monthly deficits erode capital reserves and trigger debt risk.",
                "Temporarily halt discretionary spending (Shopping and Entertainment) for the remainder of this cycle.",
                deficit
            ));
        }

        // 3. Savings Rate Evaluation
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0 && totalExpense.compareTo(totalIncome) <= 0) {
            BigDecimal net = totalIncome.subtract(totalExpense);
            BigDecimal rate = net.divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            BigDecimal target = BigDecimal.valueOf(user.getSavingsTargetGoal());
            if (rate.compareTo(target) >= 0) {
                list.add(new AdvisorRecommendationDto(
                    "SAVINGS_ACHIEVED", "positive", "Target Savings Rate Achieved",
                    "Your current savings rate is " + rate.setScale(1, RoundingMode.HALF_UP) + "%, surpassing your benchmark of " + target + "%.",
                    "Rule: Sustained savings discipline accelerates financial independence.",
                    "Direct surplus cashflow into diversified liquid index funds or emergency reserves.",
                    null
                ));
            } else {
                BigDecimal needed = totalIncome.multiply(target.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP))
                        .subtract(net);
                list.add(new AdvisorRecommendationDto(
                    "SAVINGS_SHORTFALL", "warning", "Savings Rate Below Target Benchmark",
                    "Your savings rate is " + rate.setScale(1, RoundingMode.HALF_UP) + "%, below your target of " + target + "%.",
                    "Rule: Falling short impairs capital growth trajectories.",
                    "Review top variable expenses and target a 10% reduction.",
                    needed
                ));
            }
        }

        // 4. Overbudget Triggers
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(user.getId(), yearMonth.toString());
        for (Budget b : budgets) {
            BigDecimal spent = expenseRepository.sumByCategoryAndDateRange(user.getId(), b.getCategory(), start, end)
                    .orElse(BigDecimal.ZERO);
            if (spent.compareTo(b.getLimitAmount()) > 0) {
                BigDecimal over = spent.subtract(b.getLimitAmount());
                list.add(new AdvisorRecommendationDto(
                    "OVERBUDGET_" + b.getCategory().name(), "critical", "Overbudget: " + b.getCategory().name(),
                    "Spent " + user.getCurrency() + spent + " against " + user.getCurrency() + b.getLimitAmount() + " limit.",
                    "Rule: Hard category limits protect monthly liquidity.",
                    "Freeze further discretionary expenses in " + b.getCategory().name() + " until next month.",
                    over
                ));
            }
        }

        return list;
    }
}
