package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverduePaymentStatementDto {
    private CustomerDto customer;
    private List<OverduePaymentResponseDto> overduePayments;
    private List<Long> attachmentIds;
    private OverduePaymentSummaryDto summary;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverduePaymentSummaryDto {
        private Integer totalOverdueCount;
        private BigDecimal totalOriginalAmount;
        private BigDecimal totalPenaltyAmount;
        private BigDecimal totalAmount;
        private String currency;
        private Integer averageDaysOverdue;
        private Integer maxDaysOverdue;
        private Integer totalRemindersCount;
        private List<PaymentTypeSummaryDto> paymentTypeSummaries;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentTypeSummaryDto {
        private String paymentTypeCode;
        private String paymentTypeName;
        private Integer count;
        private BigDecimal totalAmount;
        private Integer averageDaysOverdue;
    }
} 