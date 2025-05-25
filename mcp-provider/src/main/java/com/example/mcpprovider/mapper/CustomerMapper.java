package com.example.mcpprovider.mapper;

import com.example.mcpprovider.dto.AccountSummaryDto;
import com.example.mcpprovider.dto.CustomerDetailDto;
import com.example.mcpprovider.dto.CustomerDto;
import com.example.mcpprovider.entity.Account;
import com.example.mcpprovider.entity.Customer;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CustomerMapper {
    
    public CustomerDto toDto(Customer customer) {
        if (customer == null) {
            return null;
        }
        
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setFirstName(customer.getFirstName());
        dto.setLastName(customer.getLastName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setStatus(customer.getStatus());
        dto.setCreatedAt(customer.getCreatedAt());
        dto.setUpdatedAt(customer.getUpdatedAt());
        
        return dto;
    }
    
    public CustomerDetailDto toDetailDto(Customer customer) {
        if (customer == null) {
            return null;
        }
        
        CustomerDetailDto dto = new CustomerDetailDto();
        dto.setId(customer.getId());
        dto.setFirstName(customer.getFirstName());
        dto.setLastName(customer.getLastName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setStatus(customer.getStatus());
        dto.setCreatedAt(customer.getCreatedAt());
        dto.setUpdatedAt(customer.getUpdatedAt());
        
        // Set counts only if collections are initialized to avoid N+1 problems
        dto.setAccountCount(Hibernate.isInitialized(customer.getAccounts()) && customer.getAccounts() != null ? customer.getAccounts().size() : 0);
        dto.setCardCount(Hibernate.isInitialized(customer.getCards()) && customer.getCards() != null ? customer.getCards().size() : 0);
        dto.setTransactionCount(Hibernate.isInitialized(customer.getTransactions()) && customer.getTransactions() != null ? customer.getTransactions().size() : 0);
        dto.setDocumentCount(Hibernate.isInitialized(customer.getDocuments()) && customer.getDocuments() != null ? customer.getDocuments().size() : 0);
        dto.setNotificationCount(Hibernate.isInitialized(customer.getNotifications()) && customer.getNotifications() != null ? customer.getNotifications().size() : 0);
        dto.setLoanApplicationCount(Hibernate.isInitialized(customer.getLoanApplications()) && customer.getLoanApplications() != null ? customer.getLoanApplications().size() : 0);
        dto.setAppointmentCount(Hibernate.isInitialized(customer.getAppointments()) && customer.getAppointments() != null ? customer.getAppointments().size() : 0);
        dto.setBudgetPlanCount(Hibernate.isInitialized(customer.getBudgetPlans()) && customer.getBudgetPlans() != null ? customer.getBudgetPlans().size() : 0);
        dto.setTaxDeclarationCount(Hibernate.isInitialized(customer.getTaxDeclarations()) && customer.getTaxDeclarations() != null ? customer.getTaxDeclarations().size() : 0);
        
        // Convert accounts to summary DTOs only if accounts are initialized
        if (Hibernate.isInitialized(customer.getAccounts()) && customer.getAccounts() != null) {
            List<AccountSummaryDto> accountSummaries = customer.getAccounts().stream()
                .map(this::toAccountSummaryDto)
                .collect(Collectors.toList());
            dto.setAccounts(accountSummaries);
        }
        
        return dto;
    }
    
    private AccountSummaryDto toAccountSummaryDto(Account account) {
        if (account == null) {
            return null;
        }
        
        AccountSummaryDto dto = new AccountSummaryDto();
        dto.setId(account.getId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setAccountType(account.getAccountType());
        dto.setBalance(account.getBalance());
        dto.setCurrency(account.getCurrency());
        dto.setStatus(account.getStatus());
        dto.setCreatedAt(account.getCreatedAt());
        
        // Set counts only if collections are initialized to avoid N+1 problems
        dto.setCardCount(Hibernate.isInitialized(account.getCards()) && account.getCards() != null ? account.getCards().size() : 0);
        dto.setTransactionCount(Hibernate.isInitialized(account.getTransactions()) && account.getTransactions() != null ? account.getTransactions().size() : 0);
        
        return dto;
    }
    
    public Customer toEntity(CustomerDto dto) {
        if (dto == null) {
            return null;
        }
        
        Customer customer = new Customer();
        customer.setId(dto.getId());
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setStatus(dto.getStatus());
        
        return customer;
    }
    
    public List<CustomerDto> toDtoList(List<Customer> customers) {
        return customers.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
} 