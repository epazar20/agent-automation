package com.example.mcpprovider.dto;

import com.example.mcpprovider.model.Customer;
import lombok.Data;

import java.util.List;

@Data
public class ActionAnalysisResponse {
    
    private String content;
    private String originalContent;
    private List<String> financeActionTypes;
    private Customer customer;

    // Default constructor
    public ActionAnalysisResponse() {}

    // Constructor with all fields
    public ActionAnalysisResponse(String content, String originalContent, 
                                List<String> financeActionTypes, Customer customer) {
        this.content = content;
        this.originalContent = originalContent;
        this.financeActionTypes = financeActionTypes;
        this.customer = customer;
    }

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getOriginalContent() {
        return originalContent;
    }

    public void setOriginalContent(String originalContent) {
        this.originalContent = originalContent;
    }

    public List<String> getFinanceActionTypes() {
        return financeActionTypes;
    }

    public void setFinanceActionTypes(List<String> financeActionTypes) {
        this.financeActionTypes = financeActionTypes;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
} 