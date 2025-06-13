package com.example.mcpprovider.repository;

import com.example.mcpprovider.entity.EmailAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailAttachmentRepository extends JpaRepository<EmailAttachment, Long> {
    
    List<EmailAttachment> findByActionType(String actionType);
    
    List<EmailAttachment> findByCustomerId(Long customerId);
    
    List<EmailAttachment> findByActionTypeAndCustomerId(String actionType, Long customerId);
} 