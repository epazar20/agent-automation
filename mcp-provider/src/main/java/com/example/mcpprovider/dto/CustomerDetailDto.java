package com.example.mcpprovider.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDetailDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Summary counts instead of full lists to avoid N+1
    private int accountCount;
    private int cardCount;
    private int transactionCount;
    private int documentCount;
    private int notificationCount;
    private int loanApplicationCount;
    private int appointmentCount;
    private int budgetPlanCount;
    private int taxDeclarationCount;
    
    // Only include basic account info if needed
    private List<AccountSummaryDto> accounts;
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
} 