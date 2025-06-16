package com.example.mcpprovider.controller;

import com.example.mcpprovider.dto.CustomerDetailDto;
import com.example.mcpprovider.dto.CustomerDto;
import com.example.mcpprovider.dto.CustomerSearchRequestDto;
import com.example.mcpprovider.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CustomerController {
    
    private final CustomerService customerService;
    
    @PostMapping("/search")
    public ResponseEntity<List<CustomerDto>> searchCustomers(@RequestBody CustomerSearchRequestDto searchRequest) {
        log.info("POST /api/customers/search - Searching customers with text: {}", searchRequest.getSearchText());
        List<CustomerDto> customers = customerService.searchCustomers(searchRequest.getSearchText());
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping
    public ResponseEntity<List<CustomerDto>> getAllCustomers() {
        log.info("GET /api/customers - Getting all customers");
        List<CustomerDto> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailDto> getCustomerById(@PathVariable Long id) {
        log.info("GET /api/customers/{} - Getting customer by id", id);
        Optional<CustomerDetailDto> customer = customerService.getCustomerDetailById(id);
        return customer.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/basic")
    public ResponseEntity<CustomerDto> getCustomerBasicById(@PathVariable Long id) {
        log.info("GET /api/customers/{}/basic - Getting basic customer info by id", id);
        Optional<CustomerDto> customer = customerService.getCustomerById(id);
        return customer.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<CustomerDto> getCustomerByEmail(@PathVariable String email) {
        log.info("GET /api/customers/email/{} - Getting customer by email", email);
        Optional<CustomerDto> customer = customerService.getCustomerByEmail(email);
        return customer.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/name")
    public ResponseEntity<CustomerDto> getCustomerByName(
            @RequestParam String firstName, 
            @RequestParam String lastName) {
        log.info("GET /api/customers/name - Getting customer by name: {} {}", firstName, lastName);
        Optional<CustomerDto> customer = customerService.getCustomerByName(firstName, lastName);
        return customer.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<CustomerDto>> searchCustomersByName(@RequestParam String name) {
        log.info("GET /api/customers/search - Searching customers by name: {}", name);
        List<CustomerDto> customers = customerService.searchCustomersByName(name);
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<CustomerDto>> getCustomersByStatus(@PathVariable String status) {
        log.info("GET /api/customers/status/{} - Getting customers by status", status);
        List<CustomerDto> customers = customerService.getCustomersByStatus(status);
        return ResponseEntity.ok(customers);
    }
    
    @PostMapping
    public ResponseEntity<CustomerDto> createCustomer(@Valid @RequestBody CustomerDto customer) {
        log.info("POST /api/customers - Creating new customer: {}", customer.getEmail());
        
        if (customerService.existsByEmail(customer.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        
        CustomerDto createdCustomer = customerService.createCustomer(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCustomer);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CustomerDto> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerDto customer) {
        log.info("PUT /api/customers/{} - Updating customer", id);
        
        if (!customerService.getCustomerEntityById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        customer.setId(id);
        CustomerDto updatedCustomer = customerService.updateCustomer(customer);
        return ResponseEntity.ok(updatedCustomer);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        log.info("DELETE /api/customers/{} - Deleting customer", id);
        
        if (!customerService.getCustomerEntityById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
} 