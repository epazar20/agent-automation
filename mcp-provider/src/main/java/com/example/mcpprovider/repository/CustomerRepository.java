package com.example.mcpprovider.repository;

import com.example.mcpprovider.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {
    
    Optional<Customer> findByEmail(String email);
    
    List<Customer> findByStatus(String status);
    
    @Query("SELECT c FROM Customer c WHERE LOWER(c.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Customer> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT c FROM Customer c WHERE c.firstName = :firstName AND c.lastName = :lastName")
    Optional<Customer> findByFirstNameAndLastName(@Param("firstName") String firstName, @Param("lastName") String lastName);
    
    @Query("SELECT c FROM Customer c WHERE c.phone = :phone")
    Optional<Customer> findByPhone(@Param("phone") String phone);
    
    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.accounts WHERE c.id = :id")
    Optional<Customer> findByIdWithAccounts(@Param("id") Long id);
    
    @Query("SELECT c FROM Customer c " +
           "LEFT JOIN FETCH c.accounts a " +
           "LEFT JOIN FETCH a.cards " +
           "WHERE c.id = :id")
    Optional<Customer> findByIdWithAccountsAndCards(@Param("id") Long id);
} 