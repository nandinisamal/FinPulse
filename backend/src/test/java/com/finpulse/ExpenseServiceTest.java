package com.finpulse;

import com.finpulse.dto.ExpenseDto;
import com.finpulse.exception.ResourceNotFoundException;
import com.finpulse.model.Expense;
import com.finpulse.model.ExpenseCategory;
import com.finpulse.model.User;
import com.finpulse.repository.ExpenseRepository;
import com.finpulse.service.ExpenseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User("Alex Rivera", "alex@example.com", "hash", "$", new BigDecimal("6000.00"), 25);
        user.setId(1L);
    }

    @Test
    @DisplayName("Should successfully create and persist an expense")
    void testCreateExpense() {
        ExpenseDto dto = new ExpenseDto();
        dto.setAmount(new BigDecimal("120.50"));
        dto.setCategory(ExpenseCategory.Food);
        dto.setDescription("Supermarket Groceries");
        dto.setDate(LocalDate.of(2026, 10, 5));
        dto.setPaymentMethod("Credit Card");

        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Expense created = expenseService.createExpense(user, dto);

        assertNotNull(created);
        assertEquals(new BigDecimal("120.50"), created.getAmount());
        assertEquals(ExpenseCategory.Food, created.getCategory());
        assertEquals("Supermarket Groceries", created.getDescription());
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    @Test
    @DisplayName("Should prevent modifying expense belonging to a different user (user isolation)")
    void testUserIsolationOnExpenseUpdate() {
        Expense existing = new Expense(user, new BigDecimal("50.00"), ExpenseCategory.Travel, "Taxi", LocalDate.now(), "Cash");
        existing.setId(99L);

        when(expenseRepository.findById(99L)).thenReturn(Optional.of(existing));

        ExpenseDto updateDto = new ExpenseDto();
        updateDto.setAmount(new BigDecimal("75.00"));
        updateDto.setCategory(ExpenseCategory.Travel);
        updateDto.setDescription("Taxi updated");
        updateDto.setDate(LocalDate.now());

        // Attempt to update with a different user ID (999L instead of 1L)
        assertThrows(ResourceNotFoundException.class, () -> {
            expenseService.updateExpense(99L, 999L, updateDto);
        });

        verify(expenseRepository, never()).save(any(Expense.class));
    }
}
