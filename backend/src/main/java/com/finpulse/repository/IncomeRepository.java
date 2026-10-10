package com.finpulse.repository;

import com.finpulse.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT i FROM Income i WHERE i.user.id = :userId AND i.date >= :startDate AND i.date <= :endDate ORDER BY i.date DESC")
    List<Income> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id = :userId AND i.date >= :startDate AND i.date <= :endDate")
    Optional<BigDecimal> sumIncomeByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
