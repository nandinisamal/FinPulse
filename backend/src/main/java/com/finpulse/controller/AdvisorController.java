package com.finpulse.controller;

import com.finpulse.dto.AdvisorRecommendationDto;
import com.finpulse.model.User;
import com.finpulse.service.FinanceAdvisorService;
import com.finpulse.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/advisor")
public class AdvisorController {

    private final FinanceAdvisorService advisorService;
    private final UserService userService;

    public AdvisorController(FinanceAdvisorService advisorService, UserService userService) {
        this.advisorService = advisorService;
        this.userService = userService;
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<AdvisorRecommendationDto>> getRecommendations(
            Principal principal,
            @RequestParam(required = false) String monthYear) {
        User user = userService.getByEmail(principal.getName());
        YearMonth ym = monthYear != null ? YearMonth.parse(monthYear) : YearMonth.now();
        return ResponseEntity.ok(advisorService.evaluateFinancialHealth(user, ym));
    }
}
