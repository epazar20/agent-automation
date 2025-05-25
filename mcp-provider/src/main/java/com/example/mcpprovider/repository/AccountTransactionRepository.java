package com.example.mcpprovider.repository;

import com.example.mcpprovider.entity.AccountTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {
    
    List<AccountTransaction> findByAccountId(Long accountId);
    
    List<AccountTransaction> findByTransactionType(String transactionType);
    
    @Query("SELECT at FROM AccountTransaction at WHERE at.account.id = :accountId AND at.transactionType = :transactionType ORDER BY at.transactionDate DESC")
    List<AccountTransaction> findByAccountIdAndTransactionType(@Param("accountId") Long accountId, @Param("transactionType") String transactionType);
    
    @Query("SELECT at FROM AccountTransaction at WHERE at.account.id = :accountId AND at.transactionDate BETWEEN :startDate AND :endDate ORDER BY at.transactionDate DESC")
    List<AccountTransaction> findByAccountIdAndDateRange(@Param("accountId") Long accountId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT at FROM AccountTransaction at WHERE at.account.customer.firstName = :firstName AND at.account.customer.lastName = :lastName ORDER BY at.transactionDate DESC")
    List<AccountTransaction> findByCustomerName(@Param("firstName") String firstName, @Param("lastName") String lastName);
} 