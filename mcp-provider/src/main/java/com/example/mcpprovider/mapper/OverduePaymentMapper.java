package com.example.mcpprovider.mapper;

import com.example.mcpprovider.dto.OverduePaymentResponseDto;
import com.example.mcpprovider.entity.OverduePayment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OverduePaymentMapper {
    
    public OverduePaymentResponseDto toDto(OverduePayment overduePayment) {
        if (overduePayment == null) {
            return null;
        }
        
        return OverduePaymentResponseDto.builder()
                .id(overduePayment.getId())
                .customerId(overduePayment.getCustomer() != null ? overduePayment.getCustomer().getId() : null)
                .paymentTypeCode(overduePayment.getPaymentType() != null ? overduePayment.getPaymentType().getTypeCode() : null)
                .paymentTypeName(overduePayment.getPaymentType() != null ? overduePayment.getPaymentType().getTypeName() : null)
                .payeeName(overduePayment.getPayeeName())
                .payeeAccount(overduePayment.getPayeeAccount())
                .originalAmount(overduePayment.getOriginalAmount())
                .penaltyAmount(overduePayment.getPenaltyAmount())
                .totalAmount(overduePayment.getTotalAmount())
                .currency(overduePayment.getCurrency())
                .originalDueDate(overduePayment.getOriginalDueDate())
                .currentDueDate(overduePayment.getCurrentDueDate())
                .daysOverdue(overduePayment.getDaysOverdue())
                .paymentReference(overduePayment.getPaymentReference())
                .description(overduePayment.getDescription())
                .reminderCount(overduePayment.getReminderCount())
                .lastReminderDate(overduePayment.getLastReminderDate())
                .status(overduePayment.getStatus())
                .paidDate(overduePayment.getPaidDate())
                .paidAmount(overduePayment.getPaidAmount())
                .createdAt(overduePayment.getCreatedAt())
                .updatedAt(overduePayment.getUpdatedAt())
                .build();
    }
    
    public List<OverduePaymentResponseDto> toDtoList(List<OverduePayment> overduePayments) {
        if (overduePayments == null) {
            return null;
        }
        
        return overduePayments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
} 