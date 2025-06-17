package com.example.mcpprovider.service;

import com.example.mcpprovider.dto.*;
import com.example.mcpprovider.entity.OverduePayment;
import com.example.mcpprovider.mapper.OverduePaymentMapper;
import com.example.mcpprovider.repository.OverduePaymentRepository;
import com.example.mcpprovider.specification.OverduePaymentSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OverduePaymentService {
    
    private final OverduePaymentRepository overduePaymentRepository;
    private final OverduePaymentMapper overduePaymentMapper;
    private final CustomerService customerService;
    private final DocumentGenerationService documentGenerationService;
    
    public OverduePaymentStatementDto getOverduePaymentStatement(OverduePaymentFilterDto filter) {
        try {
            log.info("Getting overdue payment statement for customer: {}", filter.getCustomerId());
            
            // Validate mandatory fields
            if (filter.getCustomerId() == null) {
                throw new IllegalArgumentException("Customer ID is required");
            }
            
            // Get customer information
            CustomerDto customer = customerService.getCustomerById(filter.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with ID: " + filter.getCustomerId()));
            
            // Build specification for dynamic filtering
            Specification<OverduePayment> spec = OverduePaymentSpecification.buildSpecification(filter);
            
            // Apply sorting
            Sort sort = buildSort(filter);
            
            // Apply pagination if specified
            List<OverduePayment> overduePayments;
            if (filter.getLimit() != null || filter.getOffset() != null) {
                int limit = filter.getLimit() != null ? filter.getLimit() : 50;
                int offset = filter.getOffset() != null ? filter.getOffset() : 0;
                Pageable pageable = PageRequest.of(offset / limit, limit, sort);
                Page<OverduePayment> page = overduePaymentRepository.findAll(spec, pageable);
                overduePayments = page.getContent();
            } else {
                overduePayments = overduePaymentRepository.findAll(spec, sort);
            }
            
            log.info("Found {} overdue payments for customer: {}", overduePayments.size(), filter.getCustomerId());
            
            // Convert to DTOs
            List<OverduePaymentResponseDto> overduePaymentDtos = overduePaymentMapper.toDtoList(overduePayments);
            
            // Create summary
            OverduePaymentStatementDto.OverduePaymentSummaryDto summary = createSummary(overduePayments, filter.getCustomerId());
            
            // Generate PDF document
            List<Long> attachmentIds = new ArrayList<>();
            log.info("Generating overdue payment statement document");
            
            OverduePaymentStatementDto tempStatement = OverduePaymentStatementDto.builder()
                .customer(customer)
                .overduePayments(overduePaymentDtos)
                .summary(summary)
                .build();
                
            Long attachmentId = documentGenerationService.generateOverduePaymentStatementDocument(tempStatement);
            attachmentIds.add(attachmentId);
            
            log.info("Document generated with attachment ID: {}", attachmentId);
            
            // Create final response
            OverduePaymentStatementDto response = OverduePaymentStatementDto.builder()
                .customer(customer)
                .overduePayments(overduePaymentDtos)
                .attachmentIds(attachmentIds)
                .summary(summary)
                .build();
            
            log.info("Returning overdue payment statement with {} payments and {} attachments", 
                overduePaymentDtos.size(), attachmentIds.size());
            
            return response;
            
        } catch (Exception e) {
            log.error("Error while getting overdue payment statement: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    private Sort buildSort(OverduePaymentFilterDto filter) {
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "originalDueDate";
        String sortOrder = filter.getSortOrder() != null ? filter.getSortOrder() : "desc";
        
        // Map sort fields to actual entity fields
        String actualSortField;
        switch (sortBy.toLowerCase()) {
            case "original_due_date":
            case "originalDueDate":
                actualSortField = "originalDueDate";
                break;
            case "total_amount":
            case "totalAmount":
                actualSortField = "totalAmount";
                break;
            case "days_overdue":
            case "daysOverdue":
                actualSortField = "daysOverdue";
                break;
            case "created_at":
            case "createdAt":
                actualSortField = "createdAt";
                break;
            default:
                actualSortField = "originalDueDate";
        }
        
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? 
            Sort.Direction.ASC : Sort.Direction.DESC;
            
        return Sort.by(direction, actualSortField);
    }
    
    private OverduePaymentStatementDto.OverduePaymentSummaryDto createSummary(List<OverduePayment> overduePayments, Long customerId) {
        if (overduePayments.isEmpty()) {
            return OverduePaymentStatementDto.OverduePaymentSummaryDto.builder()
                .totalOverdueCount(0)
                .totalOriginalAmount(BigDecimal.ZERO)
                .totalPenaltyAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .currency("TRY")
                .averageDaysOverdue(0)
                .maxDaysOverdue(0)
                .totalRemindersCount(0)
                .paymentTypeSummaries(new ArrayList<>())
                .build();
        }
        
        // Calculate totals
        BigDecimal totalOriginalAmount = overduePayments.stream()
            .map(OverduePayment::getOriginalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal totalPenaltyAmount = overduePayments.stream()
            .map(OverduePayment::getPenaltyAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal totalAmount = overduePayments.stream()
            .map(OverduePayment::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        // Calculate averages
        double averageDaysOverdue = overduePayments.stream()
            .mapToInt(OverduePayment::getDaysOverdue)
            .average()
            .orElse(0.0);
            
        int maxDaysOverdue = overduePayments.stream()
            .mapToInt(OverduePayment::getDaysOverdue)
            .max()
            .orElse(0);
            
        int totalRemindersCount = overduePayments.stream()
            .mapToInt(OverduePayment::getReminderCount)
            .sum();
        
        // Group by payment type
        Map<String, List<OverduePayment>> groupedByType = overduePayments.stream()
            .filter(op -> op.getPaymentType() != null)
            .collect(Collectors.groupingBy(op -> op.getPaymentType().getTypeCode()));
            
        List<OverduePaymentStatementDto.PaymentTypeSummaryDto> paymentTypeSummaries = groupedByType.entrySet().stream()
            .map(entry -> {
                List<OverduePayment> payments = entry.getValue();
                String typeCode = entry.getKey();
                String typeName = payments.get(0).getPaymentType().getTypeName();
                
                BigDecimal typeTotal = payments.stream()
                    .map(OverduePayment::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                double typeAverageDays = payments.stream()
                    .mapToInt(OverduePayment::getDaysOverdue)
                    .average()
                    .orElse(0.0);
                
                return OverduePaymentStatementDto.PaymentTypeSummaryDto.builder()
                    .paymentTypeCode(typeCode)
                    .paymentTypeName(typeName)
                    .count(payments.size())
                    .totalAmount(typeTotal)
                    .averageDaysOverdue((int) Math.round(typeAverageDays))
                    .build();
            })
            .collect(Collectors.toList());
        
        return OverduePaymentStatementDto.OverduePaymentSummaryDto.builder()
            .totalOverdueCount(overduePayments.size())
            .totalOriginalAmount(totalOriginalAmount)
            .totalPenaltyAmount(totalPenaltyAmount)
            .totalAmount(totalAmount)
            .currency(overduePayments.get(0).getCurrency())
            .averageDaysOverdue((int) Math.round(averageDaysOverdue))
            .maxDaysOverdue(maxDaysOverdue)
            .totalRemindersCount(totalRemindersCount)
            .paymentTypeSummaries(paymentTypeSummaries)
            .build();
    }
} 