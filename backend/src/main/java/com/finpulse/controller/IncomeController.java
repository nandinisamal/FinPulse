package com.finpulse.controller;

import com.finpulse.dto.IncomeDto;
import com.finpulse.model.Income;
import com.finpulse.model.User;
import com.finpulse.service.IncomeService;
import com.finpulse.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/incomes")
public class IncomeController {

    private final IncomeService incomeService;
    private final UserService userService;

    public IncomeController(IncomeService incomeService, UserService userService) {
        this.incomeService = incomeService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Income>> getIncomes(
            Principal principal,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(incomeService.getFilteredIncomes(user.getId(), startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<Income> createIncome(@Valid @RequestBody IncomeDto dto, Principal principal) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(incomeService.createIncome(user, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Income> updateIncome(
            @PathVariable Long id,
            @Valid @RequestBody IncomeDto dto,
            Principal principal) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(incomeService.updateIncome(id, user.getId(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id, Principal principal) {
        User user = userService.getByEmail(principal.getName());
        incomeService.deleteIncome(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
