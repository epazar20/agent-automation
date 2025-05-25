package com.example.mcpprovider.controller;

import com.example.mcpprovider.entity.CreditCardDebt;
import com.example.mcpprovider.service.CreditCardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/credit-cards")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CreditCardController {
    
    private final CreditCardService creditCardService;
    
    @GetMapping("/debts")
    public ResponseEntity<List<CreditCardDebt>> getAllDebts() {
        log.info("GET /api/credit-cards/debts - Getting all credit card debts");
        List<CreditCardDebt> debts = creditCardService.getAllDebts();
        return ResponseEntity.ok(debts);
    }
    
    @GetMapping("/debts/{id}")
    public ResponseEntity<CreditCardDebt> getDebtById(@PathVariable Long id) {
        log.info("GET /api/credit-cards/debts/{} - Getting debt by id", id);
        Optional<CreditCardDebt> debt = creditCardService.getDebtById(id);
        return debt.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{cardId}/debts")
    public ResponseEntity<List<CreditCardDebt>> getDebtsByCardId(@PathVariable Long cardId) {
        log.info("GET /api/credit-cards/{}/debts - Getting debts by card id", cardId);
        List<CreditCardDebt> debts = creditCardService.getDebtsByCardId(cardId);
        return ResponseEntity.ok(debts);
    }
    
    @GetMapping("/debts/customer")
    public ResponseEntity<List<CreditCardDebt>> getDebtsByCustomerName(
            @RequestParam String firstName, 
            @RequestParam String lastName) {
        log.info("GET /api/credit-cards/debts/customer - Getting debts by customer name: {} {}", firstName, lastName);
        List<CreditCardDebt> debts = creditCardService.getDebtsByCustomerName(firstName, lastName);
        return ResponseEntity.ok(debts);
    }
    
    @GetMapping("/debts/customer/unpaid")
    public ResponseEntity<List<CreditCardDebt>> getUnpaidDebtsByCustomerName(
            @RequestParam String firstName, 
            @RequestParam String lastName) {
        log.info("GET /api/credit-cards/debts/customer/unpaid - Getting unpaid debts by customer name: {} {}", firstName, lastName);
        List<CreditCardDebt> debts = creditCardService.getUnpaidDebtsByCustomerName(firstName, lastName);
        return ResponseEntity.ok(debts);
    }
    
    @GetMapping("/debts/overdue")
    public ResponseEntity<List<CreditCardDebt>> getOverdueDebts() {
        log.info("GET /api/credit-cards/debts/overdue - Getting overdue debts");
        List<CreditCardDebt> debts = creditCardService.getOverdueDebts();
        return ResponseEntity.ok(debts);
    }
    
    @GetMapping("/debts/due-date-range")
    public ResponseEntity<List<CreditCardDebt>> getDebtsByDueDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("GET /api/credit-cards/debts/due-date-range - Getting debts by due date range: {} to {}", startDate, endDate);
        List<CreditCardDebt> debts = creditCardService.getDebtsByDueDateRange(startDate, endDate);
        return ResponseEntity.ok(debts);
    }
    
    @PostMapping("/debts")
    public ResponseEntity<CreditCardDebt> createDebt(@Valid @RequestBody CreditCardDebt debt) {
        log.info("POST /api/credit-cards/debts - Creating new debt for card: {}", debt.getCard().getId());
        CreditCardDebt createdDebt = creditCardService.createDebt(debt);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDebt);
    }
    
    @PutMapping("/debts/{id}")
    public ResponseEntity<CreditCardDebt> updateDebt(@PathVariable Long id, @Valid @RequestBody CreditCardDebt debt) {
        log.info("PUT /api/credit-cards/debts/{} - Updating debt", id);
        
        if (!creditCardService.getDebtById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        debt.setId(id);
        CreditCardDebt updatedDebt = creditCardService.updateDebt(debt);
        return ResponseEntity.ok(updatedDebt);
    }
    
    @PostMapping("/debts/{id}/pay")
    public ResponseEntity<CreditCardDebt> payDebt(@PathVariable Long id) {
        log.info("POST /api/credit-cards/debts/{}/pay - Paying debt", id);
        
        try {
            CreditCardDebt paidDebt = creditCardService.payDebt(id);
            return ResponseEntity.ok(paidDebt);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/debts/{id}")
    public ResponseEntity<Void> deleteDebt(@PathVariable Long id) {
        log.info("DELETE /api/credit-cards/debts/{} - Deleting debt", id);
        
        if (!creditCardService.getDebtById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        creditCardService.deleteDebt(id);
        return ResponseEntity.noContent().build();
    }
} 