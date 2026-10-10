package com.finpulse.repository;

import com.finpulse.model.Expense;
import com.finpulse.model.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.date >= :startDate AND e.date <= :endDate ORDER BY e.date DESC")
    List<Expense> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.category = :category AND e.date >= :startDate AND e.date <= :endDate ORDER BY e.date DESC")
    List<Expense> findByUserIdAndCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("category") ExpenseCategory category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.date >= :startDate AND e.date <= :endDate")
    Optional<BigDecimal> sumExpenseByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.category = :category AND e.date >= :startDate AND e.date <= :endDate")
    Optional<BigDecimal> sumByCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("category") ExpenseCategory category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
