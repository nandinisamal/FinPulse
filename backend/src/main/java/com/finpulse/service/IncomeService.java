package com.finpulse.service;

import com.finpulse.dto.IncomeDto;
import com.finpulse.exception.ResourceNotFoundException;
import com.finpulse.model.Income;
import com.finpulse.model.User;
import com.finpulse.repository.IncomeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class IncomeService {

    private final IncomeRepository incomeRepository;

    public IncomeService(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    public Income createIncome(User user, IncomeDto dto) {
        Income income = new Income(
                user,
                dto.getAmount(),
                dto.getSource().trim(),
                dto.getDate(),
                dto.getNotes() != null ? dto.getNotes().trim() : null
        );
        return incomeRepository.save(income);
    }

    @Transactional(readOnly = true)
    public List<Income> getFilteredIncomes(Long userId, LocalDate start, LocalDate end) {
        if (start != null && end != null) {
            return incomeRepository.findByUserIdAndDateRange(userId, start, end);
        }
        return incomeRepository.findByUserIdOrderByDateDesc(userId);
    }

    public Income updateIncome(Long id, Long userId, IncomeDto dto) {
        Income income = incomeRepository.findById(id)
                .filter(i -> i.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Income record not found or unauthorized"));

        income.setAmount(dto.getAmount());
        income.setSource(dto.getSource().trim());
        income.setDate(dto.getDate());
        income.setNotes(dto.getNotes() != null ? dto.getNotes().trim() : null);

        return incomeRepository.save(income);
    }

    public void deleteIncome(Long id, Long userId) {
        Income income = incomeRepository.findById(id)
                .filter(i -> i.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Income record not found or unauthorized"));

        incomeRepository.delete(income);
    }
}
