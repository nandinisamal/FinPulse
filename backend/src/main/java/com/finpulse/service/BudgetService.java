package com.finpulse.service;

import com.finpulse.dto.BudgetDto;
import com.finpulse.exception.ResourceNotFoundException;
import com.finpulse.model.Budget;
import com.finpulse.model.User;
import com.finpulse.repository.BudgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public Budget createOrUpdateBudget(User user, BudgetDto dto) {
        return budgetRepository.findByUserIdAndCategoryAndMonthYear(user.getId(), dto.getCategory(), dto.getMonthYear())
                .map(existing -> {
                    existing.setLimitAmount(dto.getLimitAmount());
                    return budgetRepository.save(existing);
                })
                .orElseGet(() -> {
                    Budget b = new Budget(user, dto.getCategory(), dto.getLimitAmount(), dto.getMonthYear());
                    return budgetRepository.save(b);
                });
    }

    @Transactional(readOnly = true)
    public List<Budget> getBudgetsForMonth(Long userId, String monthYear) {
        return budgetRepository.findByUserIdAndMonthYear(userId, monthYear);
    }

    public Budget updateBudgetLimit(Long id, Long userId, BigDecimal newLimit) {
        Budget b = budgetRepository.findById(id)
                .filter(budget -> budget.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found or unauthorized"));

        b.setLimitAmount(newLimit);
        return budgetRepository.save(b);
    }

    public void deleteBudget(Long id, Long userId) {
        Budget b = budgetRepository.findById(id)
                .filter(budget -> budget.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found or unauthorized"));

        budgetRepository.delete(b);
    }
}
