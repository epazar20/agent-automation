package com.example.mcpprovider.service;

import com.example.mcpprovider.dto.CustomerDetailDto;
import com.example.mcpprovider.dto.CustomerDto;
import com.example.mcpprovider.entity.Customer;
import com.example.mcpprovider.mapper.CustomerMapper;
import com.example.mcpprovider.repository.CustomerRepository;
import com.example.mcpprovider.specification.CustomerSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    
    public List<CustomerDto> searchCustomers(String searchText) {
        log.debug("Searching customers with text: {}", searchText);
        List<Customer> customers = customerRepository.findAll(CustomerSpecification.searchCustomers(searchText));
        return customerMapper.toDtoList(customers);
    }
    
    public List<CustomerDto> getAllCustomers() {
        log.debug("Getting all customers");
        List<Customer> customers = customerRepository.findAll();
        return customerMapper.toDtoList(customers);
    }
    
    public Optional<CustomerDto> getCustomerById(Long id) {
        log.debug("Getting customer by id: {}", id);
        Optional<Customer> customer = customerRepository.findById(id);
        return customer.map(customerMapper::toDto);
    }
    
    public Optional<CustomerDetailDto> getCustomerDetailById(Long id) {
        log.debug("Getting customer detail by id: {}", id);
        // Use custom query to fetch with specific relationships to avoid N+1
        Optional<Customer> customer = customerRepository.findByIdWithAccounts(id);
        return customer.map(customerMapper::toDetailDto);
    }
    
    public Optional<CustomerDto> getCustomerByEmail(String email) {
        log.debug("Getting customer by email: {}", email);
        Optional<Customer> customer = customerRepository.findByEmail(email);
        return customer.map(customerMapper::toDto);
    }
    
    public Optional<CustomerDto> getCustomerByName(String firstName, String lastName) {
        log.debug("Getting customer by name: {} {}", firstName, lastName);
        Optional<Customer> customer = customerRepository.findByFirstNameAndLastName(firstName, lastName);
        return customer.map(customerMapper::toDto);
    }
    
    public List<CustomerDto> searchCustomersByName(String name) {
        log.debug("Searching customers by name: {}", name);
        List<Customer> customers = customerRepository.findByNameContaining(name);
        return customerMapper.toDtoList(customers);
    }
    
    public List<CustomerDto> getCustomersByStatus(String status) {
        log.debug("Getting customers by status: {}", status);
        List<Customer> customers = customerRepository.findByStatus(status);
        return customerMapper.toDtoList(customers);
    }
    
    public CustomerDto createCustomer(CustomerDto customerDto) {
        log.debug("Creating new customer: {}", customerDto.getEmail());
        Customer customer = customerMapper.toEntity(customerDto);
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toDto(savedCustomer);
    }
    
    public CustomerDto updateCustomer(CustomerDto customerDto) {
        log.debug("Updating customer: {}", customerDto.getId());
        Customer customer = customerMapper.toEntity(customerDto);
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toDto(savedCustomer);
    }
    
    public void deleteCustomer(Long id) {
        log.debug("Deleting customer: {}", id);
        customerRepository.deleteById(id);
    }
    
    public boolean existsByEmail(String email) {
        return customerRepository.findByEmail(email).isPresent();
    }
    
    // Internal method for backward compatibility
    public Optional<Customer> getCustomerEntityById(Long id) {
        return customerRepository.findById(id);
    }
} 