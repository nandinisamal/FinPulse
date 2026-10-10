package com.finpulse.service;

import com.finpulse.dto.ExpenseDto;
import com.finpulse.exception.ResourceNotFoundException;
import com.finpulse.model.Expense;
import com.finpulse.model.ExpenseCategory;
import com.finpulse.model.User;
import com.finpulse.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public Expense createExpense(User user, ExpenseDto dto) {
        Expense expense = new Expense(
                user,
                dto.getAmount(),
                dto.getCategory(),
                dto.getDescription().trim(),
                dto.getDate(),
                dto.getPaymentMethod()
        );
        return expenseRepository.save(expense);
    }

    @Transactional(readOnly = true)
    public List<Expense> getFilteredExpenses(Long userId, String categoryStr, LocalDate start, LocalDate end) {
        LocalDate startDate = start != null ? start : LocalDate.of(2000, 1, 1);
        LocalDate endDate = end != null ? end : LocalDate.of(2099, 12, 31);

        if (categoryStr != null && !categoryStr.equalsIgnoreCase("ALL")) {
            ExpenseCategory cat = ExpenseCategory.valueOf(categoryStr);
            return expenseRepository.findByUserIdAndCategoryAndDateRange(userId, cat, startDate, endDate);
        }

        return expenseRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    public Expense updateExpense(Long id, Long userId, ExpenseDto dto) {
        Expense expense = expenseRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found or unauthorized"));

        expense.setAmount(dto.getAmount());
        expense.setCategory(dto.getCategory());
        expense.setDescription(dto.getDescription().trim());
        expense.setDate(dto.getDate());
        expense.setPaymentMethod(dto.getPaymentMethod());

        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found or unauthorized"));

        expenseRepository.delete(expense);
    }
}
