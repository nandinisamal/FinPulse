package com.finpulse;

import com.finpulse.dto.AdvisorRecommendationDto;
import com.finpulse.model.Budget;
import com.finpulse.model.ExpenseCategory;
import com.finpulse.model.User;
import com.finpulse.repository.BudgetRepository;
import com.finpulse.repository.ExpenseRepository;
import com.finpulse.repository.IncomeRepository;
import com.finpulse.service.FinanceAdvisorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinanceAdvisorServiceTest {

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private FinanceAdvisorService advisorService;

    private User testUser;
    private YearMonth testMonth;

    @BeforeEach
    void setUp() {
        testUser = new User("Alex Rivera", "alex@example.com", "hash", "$", new BigDecimal("6000.00"), 25);
        testUser.setId(1L);
        testMonth = YearMonth.of(2026, 10);
    }

    @Test
    @DisplayName("Should detect missing income and issue warning recommendation")
    void testMissingIncomeRecommendation() {
        when(incomeRepository.sumIncomeByUserIdAndDateRange(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Optional.of(BigDecimal.ZERO));
        when(expenseRepository.sumExpenseByUserIdAndDateRange(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Optional.of(new BigDecimal("1500.00")));
        when(budgetRepository.findByUserIdAndMonthYear(eq(1L), eq("2026-10")))
                .thenReturn(Collections.emptyList());

        List<AdvisorRecommendationDto> recs = advisorService.evaluateFinancialHealth(testUser, testMonth);

        assertNotNull(recs);
        assertTrue(recs.stream().anyMatch(r -> r.getId().equals("MISSING_INCOME")));
    }

    @Test
    @DisplayName("Should detect deficit when expenses exceed income")
    void testDeficitWarning() {
        when(incomeRepository.sumIncomeByUserIdAndDateRange(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Optional.of(new BigDecimal("3000.00")));
        when(expenseRepository.sumExpenseByUserIdAndDateRange(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Optional.of(new BigDecimal("3500.00")));
        when(budgetRepository.findByUserIdAndMonthYear(eq(1L), eq("2026-10")))
                .thenReturn(Collections.emptyList());

        List<AdvisorRecommendationDto> recs = advisorService.evaluateFinancialHealth(testUser, testMonth);

        assertTrue(recs.stream().anyMatch(r -> r.getId().equals("DEFICIT_WARNING")));
        AdvisorRecommendationDto deficitRec = recs.stream()
                .filter(r -> r.getId().equals("DEFICIT_WARNING"))
                .findFirst()
                .orElse(null);
        assertNotNull(deficitRec);
        assertEquals(new BigDecimal("500.00"), deficitRec.getPotentialSavings());
    }

    @Test
    @DisplayName("Should detect overbudget when category expenses exceed budget limit")
    void testOverbudgetDetection() {
        when(incomeRepository.sumIncomeByUserIdAndDateRange(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Optional.of(new BigDecimal("6000.00")));
        when(expenseRepository.sumExpenseByUserIdAndDateRange(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Optional.of(new BigDecimal("4000.00")));

        Budget foodBudget = new Budget(testUser, ExpenseCategory.Food, new BigDecimal("500.00"), "2026-10");
        when(budgetRepository.findByUserIdAndMonthYear(eq(1L), eq("2026-10")))
                .thenReturn(List.of(foodBudget));
        when(expenseRepository.sumByCategoryAndDateRange(eq(1L), eq(ExpenseCategory.Food), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Optional.of(new BigDecimal("620.00")));

        List<AdvisorRecommendationDto> recs = advisorService.evaluateFinancialHealth(testUser, testMonth);

        assertTrue(recs.stream().anyMatch(r -> r.getId().equals("OVERBUDGET_Food")));
    }
}
