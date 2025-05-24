package com.example.mcpprovider.dto;

import com.example.mcpprovider.enums.FinanceActionType;
import com.example.mcpprovider.model.Customer;

import java.util.List;

public class ActionAnalysisResponse {
    
    private String content;
    private String extraContent;
    private List<FinanceActionType> financeActionTypes;
    private Customer customer;

    // Default constructor
    public ActionAnalysisResponse() {}

    // Constructor with all fields
    public ActionAnalysisResponse(String content, String extraContent, 
                                List<FinanceActionType> financeActionTypes, Customer customer) {
        this.content = content;
        this.extraContent = extraContent;
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

    public String getExtraContent() {
        return extraContent;
    }

    public void setExtraContent(String extraContent) {
        this.extraContent = extraContent;
    }

    public List<FinanceActionType> getFinanceActionTypes() {
        return financeActionTypes;
    }

    public void setFinanceActionTypes(List<FinanceActionType> financeActionTypes) {
        this.financeActionTypes = financeActionTypes;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
} 