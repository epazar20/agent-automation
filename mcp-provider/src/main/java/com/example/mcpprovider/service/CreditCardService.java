package com.example.mcpprovider.service;

import com.example.mcpprovider.entity.CreditCardDebt;
import com.example.mcpprovider.repository.CreditCardDebtRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CreditCardService {
    
    private final CreditCardDebtRepository creditCardDebtRepository;
    
    public List<CreditCardDebt> getAllDebts() {
        log.debug("Getting all credit card debts");
        return creditCardDebtRepository.findAll();
    }
    
    public Optional<CreditCardDebt> getDebtById(Long id) {
        log.debug("Getting debt by id: {}", id);
        return creditCardDebtRepository.findById(id);
    }
    
    public List<CreditCardDebt> getDebtsByCardId(Long cardId) {
        log.debug("Getting debts by card id: {}", cardId);
        return creditCardDebtRepository.findByCardId(cardId);
    }
    
    public List<CreditCardDebt> getDebtsByCustomerName(String firstName, String lastName) {
        log.debug("Getting debts by customer name: {} {}", firstName, lastName);
        return creditCardDebtRepository.findByCustomerName(firstName, lastName);
    }
    
    public List<CreditCardDebt> getUnpaidDebtsByCustomerName(String firstName, String lastName) {
        log.debug("Getting unpaid debts by customer name: {} {}", firstName, lastName);
        return creditCardDebtRepository.findUnpaidDebtsByCustomerName(firstName, lastName);
    }
    
    public List<CreditCardDebt> getOverdueDebts() {
        log.debug("Getting overdue debts");
        return creditCardDebtRepository.findOverdueDebts();
    }
    
    public List<CreditCardDebt> getDebtsByDueDateRange(LocalDate startDate, LocalDate endDate) {
        log.debug("Getting debts by due date range: {} to {}", startDate, endDate);
        return creditCardDebtRepository.findByDueDateRange(startDate, endDate);
    }
    
    public CreditCardDebt createDebt(CreditCardDebt debt) {
        log.debug("Creating new debt for card: {}", debt.getCard().getId());
        return creditCardDebtRepository.save(debt);
    }
    
    public CreditCardDebt updateDebt(CreditCardDebt debt) {
        log.debug("Updating debt: {}", debt.getId());
        return creditCardDebtRepository.save(debt);
    }
    
    public CreditCardDebt payDebt(Long debtId) {
        log.debug("Paying debt: {}", debtId);
        Optional<CreditCardDebt> debtOpt = creditCardDebtRepository.findById(debtId);
        if (debtOpt.isPresent()) {
            CreditCardDebt debt = debtOpt.get();
            debt.setStatus("paid");
            debt.setRemainingAmount(java.math.BigDecimal.ZERO);
            return creditCardDebtRepository.save(debt);
        }
        throw new RuntimeException("Debt not found with id: " + debtId);
    }
    
    public void deleteDebt(Long id) {
        log.debug("Deleting debt: {}", id);
        creditCardDebtRepository.deleteById(id);
    }
} 