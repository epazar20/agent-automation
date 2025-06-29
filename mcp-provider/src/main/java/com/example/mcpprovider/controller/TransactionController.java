package com.example.mcpprovider.controller;

import com.example.mcpprovider.dto.TransactionFilterDto;
import com.example.mcpprovider.dto.TransactionResponseDto;
import com.example.mcpprovider.dto.StatementResponseDto;
import com.example.mcpprovider.entity.FinancialTransaction;
import com.example.mcpprovider.service.TransactionService;
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

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/statement")
    public ResponseEntity<StatementResponseDto> getTransactionStatement(
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String accountId,
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String direction,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) String transactionType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String descriptionContains,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false, defaultValue = "desc") String order,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String counterpartyName,
            @RequestParam(required = false) Boolean emailFlag) {

        TransactionFilterDto filter = TransactionFilterDto.builder()
                .actionType(actionType)
                .accountId(accountId)
                .customerId(customerId)
                .startDate(startDate)
                .endDate(endDate)
                .direction(direction)
                .minAmount(minAmount)
                .maxAmount(maxAmount)
                .transactionType(transactionType)
                .category(category)
                .descriptionContains(descriptionContains)
                .limit(limit)
                .order(order)
                .currency(currency)
                .counterpartyName(counterpartyName)
                .emailFlag(emailFlag)
                .build();

        StatementResponseDto statement = transactionService.getTransactionStatement(filter);
        return ResponseEntity.ok(statement);
    }

    @PostMapping("/statement")
    public ResponseEntity<StatementResponseDto> getTransactionStatementPost(
            @RequestBody TransactionFilterDto filter) {
        StatementResponseDto statement = transactionService.getTransactionStatement(filter);
        return ResponseEntity.ok(statement);
    }

    @PostMapping
    public ResponseEntity<TransactionResponseDto> createTransaction(
            @Valid @RequestBody FinancialTransaction transaction) {
        log.info("POST /api/transactions - Creating new transaction for customer: {}", 
            transaction.getCustomer() != null ? transaction.getCustomer().getId() : "null");
        TransactionResponseDto createdTransaction = transactionService.createTransaction(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
    }
}