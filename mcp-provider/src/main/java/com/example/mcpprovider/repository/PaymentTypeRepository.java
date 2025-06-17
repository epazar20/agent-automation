package com.example.mcpprovider.repository;

import com.example.mcpprovider.entity.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTypeRepository extends JpaRepository<PaymentType, Long> {
    
    Optional<PaymentType> findByTypeCode(String typeCode);
    
    List<PaymentType> findByIsActiveTrue();
    
    @Query("SELECT pt FROM PaymentType pt WHERE pt.isActive = true ORDER BY pt.typeName")
    List<PaymentType> findAllActiveOrderByName();
    
    @Query("SELECT pt FROM PaymentType pt WHERE pt.typeCode IN :typeCodes")
    List<PaymentType> findByTypeCodeIn(@Param("typeCodes") List<String> typeCodes);
} 