package com.example.mcpprovider.service;

import com.example.mcpprovider.entity.Account;
import com.example.mcpprovider.entity.AccountTransaction;
import com.example.mcpprovider.repository.AccountRepository;
import com.example.mcpprovider.repository.AccountTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AccountService {
    
    private final AccountRepository accountRepository;
    private final AccountTransactionRepository accountTransactionRepository;
    
    public List<Account> getAllAccounts() {
        log.debug("Getting all accounts");
        return accountRepository.findAll();
    }
    
    public Optional<Account> getAccountById(Long id) {
        log.debug("Getting account by id: {}", id);
        return accountRepository.findById(id);
    }
    
    public Optional<Account> getAccountByNumber(String accountNumber) {
        log.debug("Getting account by number: {}", accountNumber);
        return accountRepository.findByAccountNumber(accountNumber);
    }
    
    public List<Account> getAccountsByCustomerId(Long customerId) {
        log.debug("Getting accounts by customer id: {}", customerId);
        return accountRepository.findByCustomerId(customerId);
    }
    
    public List<Account> getAccountsByCustomerName(String firstName, String lastName) {
        log.debug("Getting accounts by customer name: {} {}", firstName, lastName);
        return accountRepository.findByCustomerName(firstName, lastName);
    }
    
    public List<AccountTransaction> getAccountTransactions(Long accountId) {
        log.debug("Getting transactions for account: {}", accountId);
        return accountTransactionRepository.findByAccountId(accountId);
    }
    
    public List<AccountTransaction> getAccountTransactionsByType(Long accountId, String transactionType) {
        log.debug("Getting {} transactions for account: {}", transactionType, accountId);
        return accountTransactionRepository.findByAccountIdAndTransactionType(accountId, transactionType);
    }
    
    public List<AccountTransaction> getAccountTransactionsByDateRange(Long accountId, LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("Getting transactions for account {} between {} and {}", accountId, startDate, endDate);
        return accountTransactionRepository.findByAccountIdAndDateRange(accountId, startDate, endDate);
    }
    
    public List<AccountTransaction> getCustomerTransactionsByName(String firstName, String lastName) {
        log.debug("Getting transactions for customer: {} {}", firstName, lastName);
        return accountTransactionRepository.findByCustomerName(firstName, lastName);
    }
    
    public Account createAccount(Account account) {
        log.debug("Creating new account for customer: {}", account.getCustomer().getId());
        return accountRepository.save(account);
    }
    
    public Account updateAccount(Account account) {
        log.debug("Updating account: {}", account.getId());
        return accountRepository.save(account);
    }
    
    public AccountTransaction createTransaction(AccountTransaction transaction) {
        log.debug("Creating transaction for account: {}", transaction.getAccount().getId());
        
        // Update account balance
        Account account = transaction.getAccount();
        BigDecimal newBalance;
        
        if ("credit".equals(transaction.getTransactionType())) {
            newBalance = account.getBalance().add(transaction.getAmount());
        } else {
            newBalance = account.getBalance().subtract(transaction.getAmount());
        }
        
        account.setBalance(newBalance);
        transaction.setBalanceAfter(newBalance);
        
        accountRepository.save(account);
        return accountTransactionRepository.save(transaction);
    }
    
    public BigDecimal getAccountBalance(Long accountId) {
        return getAccountById(accountId)
                .map(Account::getBalance)
                .orElse(BigDecimal.ZERO);
    }
} 