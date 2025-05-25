package com.example.mcpprovider.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "card_block_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardBlockHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id")
    private Card card;
    
    @Column(name = "block_type", nullable = false, length = 50)
    private String blockType;
    
    @Column(name = "block_reason", columnDefinition = "TEXT")
    private String blockReason;
    
    @Column(name = "blocked_by", length = 100)
    private String blockedBy;
    
    @Column(name = "unblocked_by", length = 100)
    private String unblockedBy;
    
    @Column(name = "blocked_at", nullable = false)
    private LocalDateTime blockedAt;
    
    @Column(name = "unblocked_at")
    private LocalDateTime unblockedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
} 