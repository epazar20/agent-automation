package com.example.mcpprovider.repository;

import com.example.mcpprovider.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    Optional<Account> findByAccountNumber(String accountNumber);
    
    List<Account> findByCustomerId(Long customerId);
    
    List<Account> findByAccountType(String accountType);
    
    List<Account> findByStatus(String status);
    
    @Query("SELECT a FROM Account a WHERE a.customer.id = :customerId AND a.accountType = :accountType")
    List<Account> findByCustomerIdAndAccountType(@Param("customerId") Long customerId, @Param("accountType") String accountType);
    
    @Query("SELECT a FROM Account a WHERE a.customer.firstName = :firstName AND a.customer.lastName = :lastName")
    List<Account> findByCustomerName(@Param("firstName") String firstName, @Param("lastName") String lastName);
} 