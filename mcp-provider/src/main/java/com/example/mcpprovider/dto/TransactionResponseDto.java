package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDto {
    private Long id;
    private String accountId;
    private String transactionType;
    private String category;
    private String direction;
    private BigDecimal amount;
    private String currency;
    private String description;
    private String counterpartyName;
    private String counterpartyIban;
    private LocalDateTime transactionDate;
} 