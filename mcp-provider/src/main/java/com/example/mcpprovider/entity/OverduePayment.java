package com.example.mcpprovider.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "overdue_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OverduePayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_type_id")
    private PaymentType paymentType;
    
    @Column(name = "recurring_payment_id")
    private Long recurringPaymentId;
    
    @Column(name = "payee_name", nullable = false, length = 200)
    private String payeeName;
    
    @Column(name = "payee_account", length = 100)
    private String payeeAccount;
    
    @Column(name = "original_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal originalAmount;
    
    @Column(name = "penalty_amount", precision = 15, scale = 2)
    private BigDecimal penaltyAmount = BigDecimal.ZERO;
    
    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(name = "currency", length = 3)
    private String currency = "TRY";
    
    @Column(name = "original_due_date", nullable = false)
    private LocalDate originalDueDate;
    
    @Column(name = "current_due_date", nullable = false)
    private LocalDate currentDueDate;
    
    @Column(name = "days_overdue", nullable = false)
    private Integer daysOverdue;
    
    @Column(name = "payment_reference", length = 100)
    private String paymentReference;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "reminder_count")
    private Integer reminderCount = 0;
    
    @Column(name = "last_reminder_date")
    private LocalDateTime lastReminderDate;
    
    @Column(name = "status", length = 20)
    private String status = "overdue";
    
    @Column(name = "paid_date")
    private LocalDateTime paidDate;
    
    @Column(name = "paid_amount", precision = 15, scale = 2)
    private BigDecimal paidAmount;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 