package com.example.mcpprovider.service;

import com.example.mcpprovider.dto.TransactionFilterDto;
import com.example.mcpprovider.dto.TransactionResponseDto;
import com.example.mcpprovider.dto.StatementResponseDto;
import com.example.mcpprovider.dto.CustomerDto;
import com.example.mcpprovider.entity.FinancialTransaction;
import com.example.mcpprovider.entity.Customer;
import com.example.mcpprovider.repository.FinancialTransactionRepository;
import com.example.mcpprovider.repository.CustomerRepository;
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
@Transactional
public class TransactionService {

    private final FinancialTransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;

    public StatementResponseDto getTransactionStatement(TransactionFilterDto filter) {
        try {
            log.info("Getting transaction statement with filter: {}", filter);
            
            // Process relative date filters
            processRelativeDates(filter);

            // Create page request with limit
            PageRequest pageRequest = createPageRequest(filter);

            // Log all filter parameters in detail
            log.info("Applying filters - customerId: {}, category: {}, transactionType: {}, direction: {}, currency: {}", 
                filter.getCustomerId(), 
                filter.getCategory(),
                filter.getTransactionType(),
                filter.getDirection(),
                filter.getCurrency());
            
            if (filter.getStartDate() != null || filter.getEndDate() != null) {
                log.info("Date range filter - startDate: {}, endDate: {}", 
                    filter.getStartDate(), filter.getEndDate());
            }
            
            if (filter.getMinAmount() != null || filter.getMaxAmount() != null) {
                log.info("Amount range filter - minAmount: {}, maxAmount: {}", 
                    filter.getMinAmount(), filter.getMaxAmount());
            }

            // Get transactions using specification
            log.info("Executing query with category filter: {}", filter.getCategory());
            List<FinancialTransaction> transactions = transactionRepository.findAll(
                TransactionSpecification.withFilter(filter),
                pageRequest
            ).getContent();

            log.info("Found {} transactions before filtering", transactions.size());

            // Get customer information if customerId is provided
            CustomerDto customerDto = null;
            if (filter.getCustomerId() != null) {
                Customer customer = customerRepository.findById(Long.parseLong(filter.getCustomerId()))
                    .orElse(null);
                if (customer != null) {
                    customerDto = CustomerDto.builder()
                        .id(customer.getId())
                        .firstName(customer.getFirstName())
                        .lastName(customer.getLastName())
                        .email(customer.getEmail())
                        .phone(customer.getPhone())
                        .status(customer.getStatus())
                        .build();
                }
            }

            // Convert transactions to DTOs
            List<TransactionResponseDto> transactionDtos = transactions.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

            // Create and return statement response
            return StatementResponseDto.builder()
                .customer(customerDto)
                .transactions(transactionDtos)
                .build();

        } catch (Exception e) {
            log.error("Error while getting transaction statement: {}", e.getMessage(), e);
            throw e;
        }
    }

    public TransactionResponseDto createTransaction(FinancialTransaction transaction) {
        try {
            log.info("Creating new transaction for customer: {}", 
                transaction.getCustomer() != null ? transaction.getCustomer().getId() : "null");

            // Validate customer
            if (transaction.getCustomer() == null || transaction.getCustomer().getId() == null) {
                throw new IllegalArgumentException("Customer is required");
            }

            // Get customer from database
            Customer customer = customerRepository.findById(transaction.getCustomer().getId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with ID: " + 
                    transaction.getCustomer().getId()));

            // Set customer
            transaction.setCustomer(customer);

            // Set transaction date if not provided
            if (transaction.getTransactionDate() == null) {
                transaction.setTransactionDate(LocalDateTime.now());
            }

            // Standardize category to lowercase
            if (transaction.getCategory() != null) {
                transaction.setCategory(transaction.getCategory().toLowerCase());
            }

            // Save transaction
            FinancialTransaction savedTransaction = transactionRepository.save(transaction);
            log.info("Created transaction with ID: {}", savedTransaction.getId());

            // Convert to DTO and return
            return toDto(savedTransaction);

        } catch (Exception e) {
            log.error("Error while creating transaction: {}", e.getMessage(), e);
            throw e;
        }
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
                            log.info("Processed relative dates - startDate: {}, endDate: {}", 
                                filter.getStartDate(), filter.getEndDate());
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

        int limit = filter.getLimit() != null ? filter.getLimit() : 100;
        log.debug("Creating page request with limit: {} and sort: {}", limit, sort);

        return PageRequest.of(0, limit, sort);
    }

    private TransactionResponseDto toDto(FinancialTransaction transaction) {
        if (transaction == null) {
            return null;
        }

        return TransactionResponseDto.builder()
            .id(transaction.getId())
            .accountId(transaction.getAccountId() != null ? "ACC-" + transaction.getAccountId() : null)
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