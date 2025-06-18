package com.example.mcpprovider.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workflows")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Workflow {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "nodes_data", nullable = false, columnDefinition = "TEXT")
    private String nodesData; // JSON string of React Flow nodes
    
    @Column(name = "edges_data", nullable = false, columnDefinition = "TEXT")
    private String edgesData; // JSON string of React Flow edges
    
    @Column(name = "version", nullable = false)
    private Integer version = 1;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "tags", length = 500)
    private String tags; // Comma separated tags for searching
    
    @Column(name = "category", length = 100)
    private String category;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    @Column(name = "last_modified_by", length = 100)
    private String lastModifiedBy;
    
    @Column(name = "execution_count", nullable = false)
    private Long executionCount = 0L;
    
    @Column(name = "last_executed_at")
    private LocalDateTime lastExecutedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 