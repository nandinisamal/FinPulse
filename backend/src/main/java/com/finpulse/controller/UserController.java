package com.finpulse.controller;

import com.finpulse.dto.AuthResponse;
import com.finpulse.model.User;
import com.finpulse.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthResponse> getProfile(Principal principal) {
        User user = userService.getByEmail(principal.getName());
        return ResponseEntity.ok(new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCurrency(),
                user.getMonthlyIncomeTarget(),
                user.getSavingsTargetGoal(),
                "User profile retrieved"
        ));
    }
}
