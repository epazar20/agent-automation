package com.example.mcpprovider.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "finance_action_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinanceActionType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "type_code", nullable = false, unique = true, length = 50)
    private String typeCode; // GENERATE_STATEMENT, SEND_EMAIL, etc.
    
    @Column(name = "type_name", nullable = false, length = 100)
    private String typeName; // Turkish name like "EKSTRE ÜRETİMİ"
    
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description; // Full description
    
    @Column(name = "sample_prompt", nullable = false, columnDefinition = "TEXT")
    private String samplePrompt; // Sample usage prompt
    
    @Column(name = "endpoint_path", nullable = false, length = 200)
    private String endpointPath; // API endpoint like "/api/transactions/statement"
    
    @Column(name = "json_schema", columnDefinition = "TEXT")
    private String jsonSchema; // JSON schema for parameters
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "sort_order")
    private Integer sortOrder;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 