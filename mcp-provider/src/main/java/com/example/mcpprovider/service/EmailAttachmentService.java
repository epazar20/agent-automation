package com.example.mcpprovider.service;

import com.example.mcpprovider.dto.EmailAttachmentResponseDto;
import com.example.mcpprovider.dto.EmailAttachmentWithContentDto;
import com.example.mcpprovider.entity.EmailAttachment;
import com.example.mcpprovider.mapper.EmailAttachmentMapper;
import com.example.mcpprovider.repository.EmailAttachmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class EmailAttachmentService {
    
    private final EmailAttachmentRepository emailAttachmentRepository;
    private final EmailAttachmentMapper emailAttachmentMapper;
    
    public List<EmailAttachmentResponseDto> getAllEmailAttachments() {
        log.debug("Getting all email attachments");
        List<EmailAttachment> attachments = emailAttachmentRepository.findAll();
        return emailAttachmentMapper.toDtoList(attachments);
    }
    
    public Optional<EmailAttachmentResponseDto> getEmailAttachmentById(Long id) {
        log.debug("Getting email attachment by id: {}", id);
        Optional<EmailAttachment> attachment = emailAttachmentRepository.findById(id);
        return attachment.map(emailAttachmentMapper::toDto);
    }
    
    public Optional<EmailAttachmentWithContentDto> getEmailAttachmentWithContentById(Long id) {
        log.debug("Getting email attachment with content by id: {}", id);
        Optional<EmailAttachment> attachment = emailAttachmentRepository.findById(id);
        return attachment.map(emailAttachmentMapper::toDtoWithContent);
    }
    
    public List<EmailAttachmentResponseDto> getEmailAttachmentsByIds(List<Long> ids) {
        log.debug("Getting email attachments by ids: {}", ids);
        List<EmailAttachment> attachments = emailAttachmentRepository.findAllById(ids);
        return emailAttachmentMapper.toDtoList(attachments);
    }
    
    public List<EmailAttachmentWithContentDto> getEmailAttachmentsWithContentByIds(List<Long> ids) {
        log.debug("Getting email attachments with content by ids: {}", ids);
        List<EmailAttachment> attachments = emailAttachmentRepository.findAllById(ids);
        return emailAttachmentMapper.toDtoWithContentList(attachments);
    }
    
    public List<EmailAttachmentResponseDto> getEmailAttachmentsByActionType(String actionType) {
        log.debug("Getting email attachments by action type: {}", actionType);
        List<EmailAttachment> attachments = emailAttachmentRepository.findByActionType(actionType);
        return emailAttachmentMapper.toDtoList(attachments);
    }
    
    public List<EmailAttachmentWithContentDto> getEmailAttachmentsWithContentByActionType(String actionType) {
        log.debug("Getting email attachments with content by action type: {}", actionType);
        List<EmailAttachment> attachments = emailAttachmentRepository.findByActionType(actionType);
        return emailAttachmentMapper.toDtoWithContentList(attachments);
    }
    
    public List<EmailAttachmentResponseDto> getEmailAttachmentsByCustomerId(Long customerId) {
        log.debug("Getting email attachments by customer id: {}", customerId);
        List<EmailAttachment> attachments = emailAttachmentRepository.findByCustomerId(customerId);
        return emailAttachmentMapper.toDtoList(attachments);
    }
    
    public List<EmailAttachmentWithContentDto> getEmailAttachmentsWithContentByCustomerId(Long customerId) {
        log.debug("Getting email attachments with content by customer id: {}", customerId);
        List<EmailAttachment> attachments = emailAttachmentRepository.findByCustomerId(customerId);
        return emailAttachmentMapper.toDtoWithContentList(attachments);
    }
    
    public List<EmailAttachmentResponseDto> getEmailAttachmentsByActionTypeAndCustomerId(String actionType, Long customerId) {
        log.debug("Getting email attachments by action type: {} and customer id: {}", actionType, customerId);
        List<EmailAttachment> attachments = emailAttachmentRepository.findByActionTypeAndCustomerId(actionType, customerId);
        return emailAttachmentMapper.toDtoList(attachments);
    }
    
    public List<EmailAttachmentWithContentDto> getEmailAttachmentsWithContentByActionTypeAndCustomerId(String actionType, Long customerId) {
        log.debug("Getting email attachments with content by action type: {} and customer id: {}", actionType, customerId);
        List<EmailAttachment> attachments = emailAttachmentRepository.findByActionTypeAndCustomerId(actionType, customerId);
        return emailAttachmentMapper.toDtoWithContentList(attachments);
    }
    
    public Optional<String> getEmailAttachmentContent(Long id) {
        log.debug("Getting email attachment content by id: {}", id);
        Optional<EmailAttachment> attachment = emailAttachmentRepository.findById(id);
        return attachment.map(EmailAttachment::getBase64Content);
    }
    
    @Transactional
    public void deleteEmailAttachment(Long id) {
        log.debug("Deleting email attachment: {}", id);
        emailAttachmentRepository.deleteById(id);
    }
    
    public boolean existsById(Long id) {
        return emailAttachmentRepository.existsById(id);
    }
} 