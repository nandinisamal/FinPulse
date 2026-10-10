package com.finpulse.controller;

import com.finpulse.dto.DashboardSummaryDto;
import com.finpulse.model.User;
import com.finpulse.service.DashboardService;
import com.finpulse.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.YearMonth;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    public DashboardController(DashboardService dashboardService, UserService userService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(
            Principal principal,
            @RequestParam(required = false) String monthYear) {
        User user = userService.getByEmail(principal.getName());
        YearMonth ym = monthYear != null ? YearMonth.parse(monthYear) : YearMonth.now();
        return ResponseEntity.ok(dashboardService.getSummary(user, ym));
    }
}
