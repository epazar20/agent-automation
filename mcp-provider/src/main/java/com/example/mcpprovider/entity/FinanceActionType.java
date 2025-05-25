package com.example.mcpprovider.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "finance_action_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinanceActionType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "type_name", nullable = false, unique = true, length = 50)
    private String typeName;
    
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "sample_prompt", nullable = false, columnDefinition = "TEXT")
    private String samplePrompt;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "json_map", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> jsonMap;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 