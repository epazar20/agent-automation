package com.example.mcpprovider.specification;

import com.example.mcpprovider.entity.Customer;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;

public class CustomerSpecification {

    public static Specification<Customer> searchCustomers(String searchText) {
        return (Root<Customer> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Add status = 'active' condition
            predicates.add(cb.equal(root.get("status"), "active"));
            
            if (searchText != null && !searchText.trim().isEmpty()) {
                String searchPattern = "%" + searchText.trim().toLowerCase() + "%";
                
                // For numeric search (ID), we need to handle it separately
                if (searchText.matches("\\d+")) {
                    predicates.add(cb.equal(root.get("id"), Long.parseLong(searchText)));
                } else if (searchText.length() >= 3) {
                    // For text fields, only search if length >= 3
                    List<Predicate> searchPredicates = new ArrayList<>();
                    searchPredicates.add(cb.like(cb.lower(root.get("firstName")), searchPattern));
                    searchPredicates.add(cb.like(cb.lower(root.get("lastName")), searchPattern));
                    searchPredicates.add(cb.like(cb.lower(root.get("email")), searchPattern));
                    
                    predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
                }
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
} 