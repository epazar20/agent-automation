package com.example.mcpprovider.model;

public class Customer {
    
    private String customerNo;
    private String accountId;
    private String name;
    private String surname;
    private String email;

    // Default constructor
    public Customer() {}

    // Constructor with all fields
    public Customer(String customerNo, String accountId, String name, String surname, String email) {
        this.customerNo = customerNo;
        this.accountId = accountId;
        this.name = name;
        this.surname = surname;
        this.email = email;
    }

    // Getters and Setters
    public String getCustomerNo() {
        return customerNo;
    }

    public void setCustomerNo(String customerNo) {
        this.customerNo = customerNo;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "Customer{" +
                "customerNo='" + customerNo + '\'' +
                ", accountId='" + accountId + '\'' +
                ", name='" + name + '\'' +
                ", surname='" + surname + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
} 