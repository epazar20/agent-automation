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
public class TransactionFilterDto {
    private String actionType;
    private String accountId;
    private String customerId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String direction;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private String transactionType;
    private String category;
    private String descriptionContains;
    private Integer limit;
    private String order;
    private String currency;
    private String counterpartyName;
    private Boolean emailFlag;
} 