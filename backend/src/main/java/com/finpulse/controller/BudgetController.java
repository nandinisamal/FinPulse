package com.finpulse.controller;

import com.finpulse.dto.BudgetDto;
import com.finpulse.model.Budget;
import com.finpulse.model.User;
import com.finpulse.service.BudgetService;
import com.finpulse.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final UserService userService;

    public BudgetController(BudgetService budgetService, UserService userService) {
        this.budgetService = budgetService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Budget>> getBudgets(
            Principal principal,
            @RequestParam String monthYear) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(budgetService.getBudgetsForMonth(user.getId(), monthYear));
    }

    @PostMapping
    public ResponseEntity<Budget> createOrUpdateBudget(
            @Valid @RequestBody BudgetDto dto,
            Principal principal) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.createOrUpdateBudget(user, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudgetLimit(
            @PathVariable Long id,
            @RequestParam BigDecimal limitAmount,
            Principal principal) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(budgetService.updateBudgetLimit(id, user.getId(), limitAmount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id, Principal principal) {
        User user = userService.getByEmail(principal.getName());
        budgetService.deleteBudget(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
