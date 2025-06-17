package com.example.mcpprovider.repository;

import com.example.mcpprovider.entity.OverduePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface OverduePaymentRepository extends JpaRepository<OverduePayment, Long>, JpaSpecificationExecutor<OverduePayment> {
    
    List<OverduePayment> findByCustomerIdAndStatus(Long customerId, String status);
    
    List<OverduePayment> findByCustomerIdOrderByOriginalDueDateDesc(Long customerId);
    
    @Query("SELECT op FROM OverduePayment op JOIN op.paymentType pt WHERE op.customer.id = :customerId AND pt.typeCode = :paymentTypeCode AND op.status = :status")
    List<OverduePayment> findByCustomerIdAndPaymentTypeCodeAndStatus(
        @Param("customerId") Long customerId, 
        @Param("paymentTypeCode") String paymentTypeCode, 
        @Param("status") String status
    );
    
    @Query("SELECT op FROM OverduePayment op WHERE op.customer.id = :customerId AND op.originalDueDate >= :startDate AND op.originalDueDate <= :endDate")
    List<OverduePayment> findByCustomerIdAndDateRange(
        @Param("customerId") Long customerId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT op FROM OverduePayment op WHERE op.customer.id = :customerId AND op.daysOverdue >= :minDays AND op.daysOverdue <= :maxDays")
    List<OverduePayment> findByCustomerIdAndDaysOverdueRange(
        @Param("customerId") Long customerId,
        @Param("minDays") Integer minDays,
        @Param("maxDays") Integer maxDays
    );
    
    @Query("SELECT op FROM OverduePayment op WHERE op.customer.id = :customerId AND op.totalAmount >= :minAmount AND op.totalAmount <= :maxAmount")
    List<OverduePayment> findByCustomerIdAndAmountRange(
        @Param("customerId") Long customerId,
        @Param("minAmount") BigDecimal minAmount,
        @Param("maxAmount") BigDecimal maxAmount
    );
    
    @Query("SELECT COUNT(op) FROM OverduePayment op WHERE op.customer.id = :customerId AND op.status = 'overdue'")
    Long countOverduePaymentsByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT SUM(op.totalAmount) FROM OverduePayment op WHERE op.customer.id = :customerId AND op.status = 'overdue'")
    BigDecimal sumTotalAmountByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT AVG(op.daysOverdue) FROM OverduePayment op WHERE op.customer.id = :customerId AND op.status = 'overdue'")
    Double averageDaysOverdueByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT MAX(op.daysOverdue) FROM OverduePayment op WHERE op.customer.id = :customerId AND op.status = 'overdue'")
    Integer maxDaysOverdueByCustomerId(@Param("customerId") Long customerId);
} 