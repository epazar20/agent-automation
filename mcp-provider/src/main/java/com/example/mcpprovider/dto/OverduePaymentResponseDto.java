package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverduePaymentResponseDto {
    private Long id;
    private Long customerId;
    private String paymentTypeCode;
    private String paymentTypeName;
    private String payeeName;
    private String payeeAccount;
    private BigDecimal originalAmount;
    private BigDecimal penaltyAmount;
    private BigDecimal totalAmount;
    private String currency;
    private LocalDate originalDueDate;
    private LocalDate currentDueDate;
    private Integer daysOverdue;
    private String paymentReference;
    private String description;
    private Integer reminderCount;
    private LocalDateTime lastReminderDate;
    private String status;
    private LocalDateTime paidDate;
    private BigDecimal paidAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 