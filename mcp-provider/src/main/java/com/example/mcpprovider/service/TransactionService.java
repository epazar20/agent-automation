package com.example.mcpprovider.service;

import com.example.mcpprovider.dto.TransactionFilterDto;
import com.example.mcpprovider.dto.TransactionResponseDto;
import com.example.mcpprovider.entity.FinancialTransaction;
import com.example.mcpprovider.repository.FinancialTransactionRepository;
import com.example.mcpprovider.specification.TransactionSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TransactionService {

    private final FinancialTransactionRepository transactionRepository;

    public List<TransactionResponseDto> getTransactions(TransactionFilterDto filter) {
        // Process relative date filters
        processRelativeDates(filter);

        // Create page request with limit
        PageRequest pageRequest = createPageRequest(filter);

        // Get transactions using specification
        List<FinancialTransaction> transactions = transactionRepository.findAll(
            TransactionSpecification.withFilter(filter),
            pageRequest
        ).getContent();

        // Convert to DTOs
        return transactions.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    private void processRelativeDates(TransactionFilterDto filter) {
        if (filter.getStartDate() == null && filter.getEndDate() == null) {
            // Handle relative date ranges like "last 7 days"
            if (filter.getActionType() != null && filter.getActionType().equals("GENERATE_STATEMENT")) {
                LocalDateTime now = LocalDateTime.now();
                if (filter.getAccountId() != null && filter.getAccountId().startsWith("now-")) {
                    String[] parts = filter.getAccountId().split("-");
                    if (parts.length == 2) {
                        try {
                            int days = Integer.parseInt(parts[1].replace("d", ""));
                            filter.setStartDate(now.minus(days, ChronoUnit.DAYS));
                            filter.setEndDate(now);
                        } catch (NumberFormatException e) {
                            log.warn("Invalid relative date format: {}", filter.getAccountId());
                        }
                    }
                }
            }
        }
    }

    private PageRequest createPageRequest(TransactionFilterDto filter) {
        Sort sort = Sort.by(
            filter.getOrder() != null && filter.getOrder().equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC,
            "transactionDate"
        );

        return PageRequest.of(
            0,
            filter.getLimit() != null ? filter.getLimit() : 100,
            sort
        );
    }

    private TransactionResponseDto toDto(FinancialTransaction transaction) {
        return TransactionResponseDto.builder()
            .id(transaction.getId())
            .accountId("ACC-" + transaction.getAccountId())
            .transactionType(transaction.getTransactionType())
            .category(transaction.getCategory())
            .direction(transaction.getDirection())
            .amount(transaction.getAmount())
            .currency(transaction.getCurrency())
            .description(transaction.getDescription())
            .counterpartyName(transaction.getCounterpartyName())
            .counterpartyIban(transaction.getCounterpartyIban())
            .transactionDate(transaction.getTransactionDate())
            .build();
    }
} 