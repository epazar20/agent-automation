package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverduePaymentFilterDto {
    private String actionType; // OVERDUE_PAYMENT
    private Long customerId; // zorunlu alan
    private String paymentTypeCode; // CREDIT_CARD, ELECTRICITY, RENT, TAX_INCOME, etc.
    private String payeeName; // Ödeme yapılacak kurum/kişi adı
    private LocalDate overdueSince; // Bu tarihten sonra geciken ödemeler
    private LocalDate overdueUntil; // Bu tarihe kadar geciken ödemeler
    private Integer minDaysOverdue; // Minimum gecikme gün sayısı
    private Integer maxDaysOverdue; // Maximum gecikme gün sayısı
    private BigDecimal minAmount; // Minimum tutar
    private BigDecimal maxAmount; // Maximum tutar
    private BigDecimal minTotalAmount; // Minimum toplam tutar (ceza dahil)
    private BigDecimal maxTotalAmount; // Maximum toplam tutar (ceza dahil)
    private String currency; // TRY, USD, EUR
    private String status; // overdue, paid, cancelled
    private Boolean hasReminders; // Hatırlatma gönderilen ödemeler
    private Integer minReminderCount; // Minimum hatırlatma sayısı
    private Integer maxReminderCount; // Maximum hatırlatma sayısı
    private String paymentReference; // Fatura no, referans no
    private String sortBy; // original_due_date, total_amount, days_overdue
    private String sortOrder; // asc, desc
    private Integer limit; // Dönen kayıt sayısı limiti
    private Integer offset; // Sayfalama için offset
} 