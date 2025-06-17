package com.example.mcpprovider.repository;

import com.example.mcpprovider.entity.FinanceActionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinanceActionTypeRepository extends JpaRepository<FinanceActionType, Long> {
    
    Optional<FinanceActionType> findByTypeCode(String typeCode);
    
    List<FinanceActionType> findByIsActiveTrue();
    
    List<FinanceActionType> findByIsActiveTrueOrderBySortOrderAsc();
    
    @Query("SELECT f FROM FinanceActionType f WHERE LOWER(f.typeName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<FinanceActionType> findByTypeNameContaining(@Param("name") String name);
    
    @Query("SELECT f FROM FinanceActionType f WHERE f.endpointPath = :endpointPath")
    Optional<FinanceActionType> findByEndpointPath(@Param("endpointPath") String endpointPath);
    
    boolean existsByTypeCode(String typeCode);
    
    boolean existsByEndpointPath(String endpointPath);
} 