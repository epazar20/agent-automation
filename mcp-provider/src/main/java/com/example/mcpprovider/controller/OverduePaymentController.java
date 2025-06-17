package com.example.mcpprovider.controller;

import com.example.mcpprovider.dto.OverduePaymentFilterDto;
import com.example.mcpprovider.dto.OverduePaymentStatementDto;
import com.example.mcpprovider.service.OverduePaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/overdue-payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OverduePaymentController {

    private final OverduePaymentService overduePaymentService;

    @GetMapping("/statement")
    public ResponseEntity<OverduePaymentStatementDto> getOverduePaymentStatement(
            @RequestParam(required = false) String actionType,
            @RequestParam @NotNull Long customerId,
            @RequestParam(required = false) String paymentTypeCode,
            @RequestParam(required = false) String payeeName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate overdueSince,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate overdueUntil,
            @RequestParam(required = false) Integer minDaysOverdue,
            @RequestParam(required = false) Integer maxDaysOverdue,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) BigDecimal minTotalAmount,
            @RequestParam(required = false) BigDecimal maxTotalAmount,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false, defaultValue = "overdue") String status,
            @RequestParam(required = false) Boolean hasReminders,
            @RequestParam(required = false) Integer minReminderCount,
            @RequestParam(required = false) Integer maxReminderCount,
            @RequestParam(required = false) String paymentReference,
            @RequestParam(required = false, defaultValue = "originalDueDate") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {

        log.info("GET /api/overdue-payments/statement - ActionType: {}, Customer ID: {}, Payment Type: {}, Status: {}", 
            actionType, customerId, paymentTypeCode, status);

        OverduePaymentFilterDto filter = OverduePaymentFilterDto.builder()
                .actionType(actionType)
                .customerId(customerId)
                .paymentTypeCode(paymentTypeCode)
                .payeeName(payeeName)
                .overdueSince(overdueSince)
                .overdueUntil(overdueUntil)
                .minDaysOverdue(minDaysOverdue)
                .maxDaysOverdue(maxDaysOverdue)
                .minAmount(minAmount)
                .maxAmount(maxAmount)
                .minTotalAmount(minTotalAmount)
                .maxTotalAmount(maxTotalAmount)
                .currency(currency)
                .status(status)
                .hasReminders(hasReminders)
                .minReminderCount(minReminderCount)
                .maxReminderCount(maxReminderCount)
                .paymentReference(paymentReference)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .limit(limit)
                .offset(offset)
                .build();

        OverduePaymentStatementDto statement = overduePaymentService.getOverduePaymentStatement(filter);
        return ResponseEntity.ok(statement);
    }

    @PostMapping("/statement")
    public ResponseEntity<OverduePaymentStatementDto> getOverduePaymentStatementPost(
            @Valid @RequestBody OverduePaymentFilterDto filter) {
        
        log.info("POST /api/overdue-payments/statement - ActionType: {}, Customer ID: {}, Payment Type: {}", 
            filter.getActionType(), filter.getCustomerId(), filter.getPaymentTypeCode());
        
        if (filter.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID is required");
        }
        
        OverduePaymentStatementDto statement = overduePaymentService.getOverduePaymentStatement(filter);
        return ResponseEntity.ok(statement);
    }

    // Specific payment type endpoints for easy access
    @GetMapping("/statement/credit-card")
    public ResponseEntity<OverduePaymentStatementDto> getCreditCardOverduePayments(
            @RequestParam(required = false) String actionType,
            @RequestParam @NotNull Long customerId,
            @RequestParam(required = false, defaultValue = "overdue") String status) {
        
        log.info("GET /api/overdue-payments/statement/credit-card - ActionType: {}, Customer ID: {}", actionType, customerId);
        
        OverduePaymentFilterDto filter = OverduePaymentFilterDto.builder()
                .actionType(actionType)
                .customerId(customerId)
                .paymentTypeCode("CREDIT_CARD")
                .status(status)
                .sortBy("originalDueDate")
                .sortOrder("desc")
                .build();
        
        OverduePaymentStatementDto statement = overduePaymentService.getOverduePaymentStatement(filter);
        return ResponseEntity.ok(statement);
    }

    @GetMapping("/statement/electricity")
    public ResponseEntity<OverduePaymentStatementDto> getElectricityOverduePayments(
            @RequestParam(required = false) String actionType,
            @RequestParam @NotNull Long customerId,
            @RequestParam(required = false, defaultValue = "overdue") String status) {
        
        log.info("GET /api/overdue-payments/statement/electricity - ActionType: {}, Customer ID: {}", actionType, customerId);
        
        OverduePaymentFilterDto filter = OverduePaymentFilterDto.builder()
                .actionType(actionType)
                .customerId(customerId)
                .paymentTypeCode("ELECTRICITY")
                .status(status)
                .sortBy("originalDueDate")
                .sortOrder("desc")
                .build();
        
        OverduePaymentStatementDto statement = overduePaymentService.getOverduePaymentStatement(filter);
        return ResponseEntity.ok(statement);
    }

    @GetMapping("/statement/rent")
    public ResponseEntity<OverduePaymentStatementDto> getRentOverduePayments(
            @RequestParam(required = false) String actionType,
            @RequestParam @NotNull Long customerId,
            @RequestParam(required = false, defaultValue = "overdue") String status) {
        
        log.info("GET /api/overdue-payments/statement/rent - ActionType: {}, Customer ID: {}", actionType, customerId);
        
        OverduePaymentFilterDto filter = OverduePaymentFilterDto.builder()
                .actionType(actionType)
                .customerId(customerId)
                .paymentTypeCode("RENT")
                .status(status)
                .sortBy("originalDueDate")
                .sortOrder("desc")
                .build();
        
        OverduePaymentStatementDto statement = overduePaymentService.getOverduePaymentStatement(filter);
        return ResponseEntity.ok(statement);
    }

    @GetMapping("/statement/tax")
    public ResponseEntity<OverduePaymentStatementDto> getTaxOverduePayments(
            @RequestParam(required = false) String actionType,
            @RequestParam @NotNull Long customerId,
            @RequestParam(required = false) String taxType, // TAX_INCOME, TAX_VEHICLE, TAX_PROPERTY
            @RequestParam(required = false, defaultValue = "overdue") String status) {
        
        log.info("GET /api/overdue-payments/statement/tax - ActionType: {}, Customer ID: {}, Tax Type: {}", actionType, customerId, taxType);
        
        OverduePaymentFilterDto.OverduePaymentFilterDtoBuilder filterBuilder = OverduePaymentFilterDto.builder()
                .actionType(actionType)
                .customerId(customerId)
                .status(status)
                .sortBy("originalDueDate")
                .sortOrder("desc");
        
        // If specific tax type is provided, filter by it, otherwise get all tax payments
        if (taxType != null && !taxType.trim().isEmpty()) {
            if (taxType.startsWith("TAX_")) {
                filterBuilder.paymentTypeCode(taxType);
            } else {
                filterBuilder.paymentTypeCode("TAX_" + taxType.toUpperCase());
            }
        } else {
            // We'll filter by payment type codes that start with "TAX_" in the service layer
            // For now, we'll use a general approach and filter in the service
        }
        
        OverduePaymentStatementDto statement = overduePaymentService.getOverduePaymentStatement(filterBuilder.build());
        return ResponseEntity.ok(statement);
    }
} 