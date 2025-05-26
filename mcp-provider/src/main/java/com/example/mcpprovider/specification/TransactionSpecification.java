package com.example.mcpprovider.specification;

import com.example.mcpprovider.dto.TransactionFilterDto;
import com.example.mcpprovider.entity.FinancialTransaction;
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

            // Direction filter
            if (StringUtils.hasText(filter.getDirection())) {
                predicates.add(criteriaBuilder.equal(
                    root.get("direction"), filter.getDirection()));
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

            // Transaction type filter
            if (StringUtils.hasText(filter.getTransactionType())) {
                predicates.add(criteriaBuilder.equal(
                    root.get("transactionType"), filter.getTransactionType()));
            }

            // Category filter
            if (StringUtils.hasText(filter.getCategory())) {
                predicates.add(criteriaBuilder.equal(
                    root.get("category"), filter.getCategory()));
            }

            // Description contains filter
            if (StringUtils.hasText(filter.getDescriptionContains())) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")),
                    "%" + filter.getDescriptionContains().toLowerCase() + "%"));
            }

            // Currency filter
            if (StringUtils.hasText(filter.getCurrency())) {
                predicates.add(criteriaBuilder.equal(
                    root.get("currency"), filter.getCurrency()));
            }

            // Counterparty name filter
            if (StringUtils.hasText(filter.getCounterpartyName())) {
                predicates.add(criteriaBuilder.equal(
                    root.get("counterpartyName"), filter.getCounterpartyName()));
            }

            // Apply sorting
            if (StringUtils.hasText(filter.getOrder())) {
                if ("desc".equalsIgnoreCase(filter.getOrder())) {
                    query.orderBy(criteriaBuilder.desc(root.get("transactionDate")));
                } else {
                    query.orderBy(criteriaBuilder.asc(root.get("transactionDate")));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}