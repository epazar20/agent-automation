package com.example.mcpprovider.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budget_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
    
    @Column(name = "plan_year", nullable = false)
    private Integer planYear;
    
    @Column(name = "plan_month")
    private Integer planMonth;
    
    @Column(name = "income_target", nullable = false, precision = 15, scale = 2)
    private BigDecimal incomeTarget;
    
    @Column(name = "expense_target", nullable = false, precision = 15, scale = 2)
    private BigDecimal expenseTarget;
    
    @Column(name = "savings_target", nullable = false, precision = 15, scale = 2)
    private BigDecimal savingsTarget;
    
    @Column(name = "status", length = 20)
    private String status = "active";
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 