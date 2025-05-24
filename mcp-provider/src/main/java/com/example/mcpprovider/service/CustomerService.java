package com.example.mcpprovider.service;

import com.example.mcpprovider.model.Customer;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    public Customer getDummyCustomer(String customerNo) {
        // Dummy customer data - will be replaced with real service integration
        return new Customer(
            customerNo != null ? customerNo : "12345",
            "ACC-" + (customerNo != null ? customerNo : "12345"),
            "Ahmet",
            "Yılmaz",
            "ahmet.yilmaz@example.com"
        );
    }
} 