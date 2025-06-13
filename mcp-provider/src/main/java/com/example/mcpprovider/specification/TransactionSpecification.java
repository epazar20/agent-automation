package com.example.mcpprovider.specification;

import com.example.mcpprovider.dto.TransactionFilterDto;
import com.example.mcpprovider.entity.FinancialTransaction;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class TransactionSpecification {

    public static Specification<FinancialTransaction> withFilter(TransactionFilterDto filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Account ID filter
            if (StringUtils.hasText(filter.getAccountId())) {
                predicates.add(criteriaBuilder.equal(root.get("accountId"), 
                    Long.parseLong(filter.getAccountId().replace("ACC-", ""))));
            }

            // Customer ID filter
            if (StringUtils.hasText(filter.getCustomerId())) {
                predicates.add(criteriaBuilder.equal(root.get("customer").get("id"), 
                    Long.parseLong(filter.getCustomerId())));
            }

            // Date range filter
            if (filter.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("transactionDate"), filter.getStartDate()));
            }
            if (filter.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("transactionDate"), filter.getEndDate()));
            }

            // Direction filter (case-insensitive)
            if (StringUtils.hasText(filter.getDirection())) {
                String directionPattern = filter.getDirection().toUpperCase();
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("direction")), 
                    directionPattern));
            }

            // Amount range filter
            if (filter.getMinAmount() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("amount"), filter.getMinAmount()));
            }
            if (filter.getMaxAmount() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("amount"), filter.getMaxAmount()));
            }

            // Transaction type filter (case-insensitive)
            if (StringUtils.hasText(filter.getTransactionType())) {
                String typePattern = filter.getTransactionType().toUpperCase();
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("transactionType")), 
                    typePattern));
            }

            // Category filter (case-insensitive)
            if (StringUtils.hasText(filter.getCategory())) {
                String categoryPattern = filter.getCategory().toLowerCase();
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.function("LOWER", String.class, root.get("category")), 
                    categoryPattern));
            }

            // Description contains filter (case-insensitive partial match)
            if (StringUtils.hasText(filter.getDescriptionContains())) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("description")),
                    "%" + filter.getDescriptionContains().toUpperCase() + "%"));
            }

            // Currency filter (case-insensitive)
            if (StringUtils.hasText(filter.getCurrency())) {
                String currencyPattern = filter.getCurrency().toUpperCase();
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("currency")), 
                    currencyPattern));
            }

            // Counterparty name filter (case-insensitive partial match)
            if (StringUtils.hasText(filter.getCounterpartyName())) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.upper(root.get("counterpartyName")),
                    "%" + filter.getCounterpartyName().toUpperCase() + "%"));
            }

            // Apply sorting
            if (StringUtils.hasText(filter.getOrder())) {
                if ("desc".equalsIgnoreCase(filter.getOrder())) {
                    query.orderBy(criteriaBuilder.desc(root.get("transactionDate")));
                } else {
                    query.orderBy(criteriaBuilder.asc(root.get("transactionDate")));
                }
            } else {
                // Default sorting by transaction date desc
                query.orderBy(criteriaBuilder.desc(root.get("transactionDate")));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}