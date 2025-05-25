package com.example.mcpprovider.repository;

import com.example.mcpprovider.entity.CreditCardDebt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CreditCardDebtRepository extends JpaRepository<CreditCardDebt, Long> {
    
    List<CreditCardDebt> findByCardId(Long cardId);
    
    List<CreditCardDebt> findByStatus(String status);
    
    @Query("SELECT ccd FROM CreditCardDebt ccd WHERE ccd.dueDate < CURRENT_DATE AND ccd.status = 'unpaid'")
    List<CreditCardDebt> findOverdueDebts();
    
    @Query("SELECT ccd FROM CreditCardDebt ccd WHERE ccd.card.customer.firstName = :firstName AND ccd.card.customer.lastName = :lastName")
    List<CreditCardDebt> findByCustomerName(@Param("firstName") String firstName, @Param("lastName") String lastName);
    
    @Query("SELECT ccd FROM CreditCardDebt ccd WHERE ccd.card.customer.firstName = :firstName AND ccd.card.customer.lastName = :lastName AND ccd.status = 'unpaid'")
    List<CreditCardDebt> findUnpaidDebtsByCustomerName(@Param("firstName") String firstName, @Param("lastName") String lastName);
    
    @Query("SELECT ccd FROM CreditCardDebt ccd WHERE ccd.dueDate BETWEEN :startDate AND :endDate")
    List<CreditCardDebt> findByDueDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
} 