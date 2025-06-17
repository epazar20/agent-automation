package com.example.mcpprovider.specification;

import com.example.mcpprovider.dto.OverduePaymentFilterDto;
import com.example.mcpprovider.entity.OverduePayment;
import com.example.mcpprovider.entity.PaymentType;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class OverduePaymentSpecification {

    public static Specification<OverduePayment> buildSpecification(OverduePaymentFilterDto filter) {
        return (Root<OverduePayment> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Join with PaymentType for filtering by payment type
            Join<OverduePayment, PaymentType> paymentTypeJoin = root.join("paymentType", JoinType.INNER);
            
            // Customer ID is mandatory
            if (filter.getCustomerId() != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), filter.getCustomerId()));
            }
            
            // Payment Type Code filter
            if (filter.getPaymentTypeCode() != null && !filter.getPaymentTypeCode().trim().isEmpty()) {
                predicates.add(cb.equal(paymentTypeJoin.get("typeCode"), filter.getPaymentTypeCode()));
            }
            
            // Payee Name filter
            if (filter.getPayeeName() != null && !filter.getPayeeName().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("payeeName")), 
                    "%" + filter.getPayeeName().toLowerCase() + "%"));
            }
            
            // Overdue date range filters
            if (filter.getOverdueSince() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("originalDueDate"), filter.getOverdueSince()));
            }
            
            if (filter.getOverdueUntil() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("originalDueDate"), filter.getOverdueUntil()));
            }
            
            // Days overdue range filters
            if (filter.getMinDaysOverdue() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("daysOverdue"), filter.getMinDaysOverdue()));
            }
            
            if (filter.getMaxDaysOverdue() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("daysOverdue"), filter.getMaxDaysOverdue()));
            }
            
            // Original amount range filters
            if (filter.getMinAmount() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("originalAmount"), filter.getMinAmount()));
            }
            
            if (filter.getMaxAmount() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("originalAmount"), filter.getMaxAmount()));
            }
            
            // Total amount range filters
            if (filter.getMinTotalAmount() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalAmount"), filter.getMinTotalAmount()));
            }
            
            if (filter.getMaxTotalAmount() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalAmount"), filter.getMaxTotalAmount()));
            }
            
            // Currency filter
            if (filter.getCurrency() != null && !filter.getCurrency().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("currency"), filter.getCurrency()));
            }
            
            // Status filter
            if (filter.getStatus() != null && !filter.getStatus().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }
            
            // Has reminders filter
            if (filter.getHasReminders() != null) {
                if (filter.getHasReminders()) {
                    predicates.add(cb.greaterThan(root.get("reminderCount"), 0));
                } else {
                    predicates.add(cb.equal(root.get("reminderCount"), 0));
                }
            }
            
            // Reminder count range filters
            if (filter.getMinReminderCount() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("reminderCount"), filter.getMinReminderCount()));
            }
            
            if (filter.getMaxReminderCount() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("reminderCount"), filter.getMaxReminderCount()));
            }
            
            // Payment reference filter
            if (filter.getPaymentReference() != null && !filter.getPaymentReference().trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("paymentReference")), 
                    "%" + filter.getPaymentReference().toLowerCase() + "%"));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
} 