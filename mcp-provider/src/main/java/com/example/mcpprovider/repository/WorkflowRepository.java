package com.example.mcpprovider.repository;

import com.example.mcpprovider.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    
    // Find active workflows
    List<Workflow> findByIsActiveTrue();
    
    // Find workflows by name (case insensitive)
    List<Workflow> findByNameContainingIgnoreCase(String name);
    
    // Find workflows by category
    List<Workflow> findByCategory(String category);
    
    // Find workflows by created by
    List<Workflow> findByCreatedBy(String createdBy);
    
    // Find workflow by exact name
    Optional<Workflow> findByNameIgnoreCase(String name);
    
    // Search workflows by name, description, tags or category
    @Query("SELECT w FROM Workflow w WHERE " +
           "LOWER(w.name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(w.description) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(w.tags) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(w.category) LIKE LOWER(CONCAT('%', :searchText, '%'))")
    List<Workflow> searchWorkflows(@Param("searchText") String searchText);
    
    // Find recent workflows
    @Query("SELECT w FROM Workflow w WHERE w.isActive = true ORDER BY w.updatedAt DESC")
    List<Workflow> findRecentWorkflows();
    
    // Find popular workflows (by execution count)
    @Query("SELECT w FROM Workflow w WHERE w.isActive = true ORDER BY w.executionCount DESC")
    List<Workflow> findPopularWorkflows();
    
    // Find workflows created after a specific date
    List<Workflow> findByCreatedAtAfter(LocalDateTime date);
    
    // Check if workflow name exists (case insensitive)
    boolean existsByNameIgnoreCase(String name);
} 