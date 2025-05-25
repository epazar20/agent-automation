package com.example.mcpprovider.controller;

import com.example.mcpprovider.entity.Account;
import com.example.mcpprovider.entity.AccountTransaction;
import com.example.mcpprovider.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AccountController {
    
    private final AccountService accountService;
    
    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        log.info("GET /api/accounts - Getting all accounts");
        List<Account> accounts = accountService.getAllAccounts();
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable Long id) {
        log.info("GET /api/accounts/{} - Getting account by id", id);
        Optional<Account> account = accountService.getAccountById(id);
        return account.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<Account> getAccountByNumber(@PathVariable String accountNumber) {
        log.info("GET /api/accounts/number/{} - Getting account by number", accountNumber);
        Optional<Account> account = accountService.getAccountByNumber(accountNumber);
        return account.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Account>> getAccountsByCustomerId(@PathVariable Long customerId) {
        log.info("GET /api/accounts/customer/{} - Getting accounts by customer id", customerId);
        List<Account> accounts = accountService.getAccountsByCustomerId(customerId);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/customer/name")
    public ResponseEntity<List<Account>> getAccountsByCustomerName(
            @RequestParam String firstName, 
            @RequestParam String lastName) {
        log.info("GET /api/accounts/customer/name - Getting accounts by customer name: {} {}", firstName, lastName);
        List<Account> accounts = accountService.getAccountsByCustomerName(firstName, lastName);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<AccountTransaction>> getAccountTransactions(@PathVariable Long id) {
        log.info("GET /api/accounts/{}/transactions - Getting transactions for account", id);
        List<AccountTransaction> transactions = accountService.getAccountTransactions(id);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/{id}/transactions/{type}")
    public ResponseEntity<List<AccountTransaction>> getAccountTransactionsByType(
            @PathVariable Long id, 
            @PathVariable String type) {
        log.info("GET /api/accounts/{}/transactions/{} - Getting {} transactions for account", id, type, type);
        List<AccountTransaction> transactions = accountService.getAccountTransactionsByType(id, type);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/{id}/transactions/range")
    public ResponseEntity<List<AccountTransaction>> getAccountTransactionsByDateRange(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/accounts/{}/transactions/range - Getting transactions for account between {} and {}", id, startDate, endDate);
        List<AccountTransaction> transactions = accountService.getAccountTransactionsByDateRange(id, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/transactions/customer")
    public ResponseEntity<List<AccountTransaction>> getCustomerTransactionsByName(
            @RequestParam String firstName, 
            @RequestParam String lastName) {
        log.info("GET /api/accounts/transactions/customer - Getting transactions for customer: {} {}", firstName, lastName);
        List<AccountTransaction> transactions = accountService.getCustomerTransactionsByName(firstName, lastName);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/{id}/balance")
    public ResponseEntity<BigDecimal> getAccountBalance(@PathVariable Long id) {
        log.info("GET /api/accounts/{}/balance - Getting balance for account", id);
        BigDecimal balance = accountService.getAccountBalance(id);
        return ResponseEntity.ok(balance);
    }
    
    @PostMapping
    public ResponseEntity<Account> createAccount(@Valid @RequestBody Account account) {
        log.info("POST /api/accounts - Creating new account for customer: {}", account.getCustomer().getId());
        Account createdAccount = accountService.createAccount(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAccount);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(@PathVariable Long id, @Valid @RequestBody Account account) {
        log.info("PUT /api/accounts/{} - Updating account", id);
        
        if (!accountService.getAccountById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        account.setId(id);
        Account updatedAccount = accountService.updateAccount(account);
        return ResponseEntity.ok(updatedAccount);
    }
    
    @PostMapping("/{id}/transactions")
    public ResponseEntity<AccountTransaction> createTransaction(
            @PathVariable Long id, 
            @Valid @RequestBody AccountTransaction transaction) {
        log.info("POST /api/accounts/{}/transactions - Creating transaction for account", id);
        
        Optional<Account> accountOpt = accountService.getAccountById(id);
        if (!accountOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        transaction.setAccount(accountOpt.get());
        AccountTransaction createdTransaction = accountService.createTransaction(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
    }
} 