package com.finpulse.controller;

import com.finpulse.dto.ExpenseDto;
import com.finpulse.model.Expense;
import com.finpulse.model.User;
import com.finpulse.service.ExpenseService;
import com.finpulse.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserService userService;

    public ExpenseController(ExpenseService expenseService, UserService userService) {
        this.expenseService = expenseService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(
            Principal principal,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(expenseService.getFilteredExpenses(user.getId(), category, startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@Valid @RequestBody ExpenseDto dto, Principal principal) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(user, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseDto dto,
            Principal principal) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(expenseService.updateExpense(id, user.getId(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id, Principal principal) {
        User user = userService.getByEmail(principal.getName());
        expenseService.deleteExpense(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
