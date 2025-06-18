package com.example.mcpprovider.service;

import com.example.mcpprovider.dto.WorkflowDto;
import com.example.mcpprovider.dto.WorkflowCreateDto;
import com.example.mcpprovider.dto.WorkflowSummaryDto;
import com.example.mcpprovider.entity.Workflow;
import com.example.mcpprovider.mapper.WorkflowMapper;
import com.example.mcpprovider.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WorkflowService {
    
    private final WorkflowRepository workflowRepository;
    private final WorkflowMapper workflowMapper;
    
    public List<WorkflowSummaryDto> getAllWorkflows() {
        log.info("Getting all workflows");
        List<Workflow> workflows = workflowRepository.findAll();
        return workflowMapper.toSummaryDtoList(workflows);
    }
    
    public List<WorkflowSummaryDto> getActiveWorkflows() {
        log.info("Getting active workflows");
        List<Workflow> workflows = workflowRepository.findByIsActiveTrue();
        return workflowMapper.toSummaryDtoList(workflows);
    }
    
    public Optional<WorkflowDto> getWorkflowById(Long id) {
        log.info("Getting workflow by id: {}", id);
        return workflowRepository.findById(id)
                .map(workflowMapper::toDto);
    }
    
    public Optional<WorkflowDto> getWorkflowByName(String name) {
        log.info("Getting workflow by name: {}", name);
        return workflowRepository.findByNameIgnoreCase(name)
                .map(workflowMapper::toDto);
    }
    
    public List<WorkflowSummaryDto> searchWorkflows(String searchText) {
        log.info("Searching workflows with text: {}", searchText);
        if (searchText == null || searchText.trim().isEmpty()) {
            return getActiveWorkflows();
        }
        List<Workflow> workflows = workflowRepository.searchWorkflows(searchText.trim());
        return workflowMapper.toSummaryDtoList(workflows);
    }
    
    public List<WorkflowSummaryDto> getWorkflowsByCategory(String category) {
        log.info("Getting workflows by category: {}", category);
        List<Workflow> workflows = workflowRepository.findByCategory(category);
        return workflowMapper.toSummaryDtoList(workflows);
    }
    
    public List<WorkflowSummaryDto> getRecentWorkflows() {
        log.info("Getting recent workflows");
        List<Workflow> workflows = workflowRepository.findRecentWorkflows();
        return workflowMapper.toSummaryDtoList(workflows);
    }
    
    public List<WorkflowSummaryDto> getPopularWorkflows() {
        log.info("Getting popular workflows");
        List<Workflow> workflows = workflowRepository.findPopularWorkflows();
        return workflowMapper.toSummaryDtoList(workflows);
    }
    
    public WorkflowDto createWorkflow(WorkflowCreateDto createDto) {
        log.info("Creating workflow: {}", createDto.getName());
        
        // Check if workflow name already exists
        if (workflowRepository.existsByNameIgnoreCase(createDto.getName())) {
            throw new IllegalArgumentException("Workflow with name '" + createDto.getName() + "' already exists");
        }
        
        Workflow workflow = workflowMapper.toEntity(createDto);
        Workflow savedWorkflow = workflowRepository.save(workflow);
        
        log.info("Workflow created successfully with id: {}", savedWorkflow.getId());
        return workflowMapper.toDto(savedWorkflow);
    }
    
    public WorkflowDto updateWorkflow(Long id, WorkflowDto updateDto) {
        log.info("Updating workflow with id: {}", id);
        
        Workflow existingWorkflow = workflowRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found with id: " + id));
        
        // Check if name is being changed and if new name already exists
        if (!existingWorkflow.getName().equalsIgnoreCase(updateDto.getName()) &&
            workflowRepository.existsByNameIgnoreCase(updateDto.getName())) {
            throw new IllegalArgumentException("Workflow with name '" + updateDto.getName() + "' already exists");
        }
        
        // Update fields
        existingWorkflow.setName(updateDto.getName());
        existingWorkflow.setDescription(updateDto.getDescription());
        existingWorkflow.setNodesData(updateDto.getNodesData());
        existingWorkflow.setEdgesData(updateDto.getEdgesData());
        existingWorkflow.setIsActive(updateDto.getIsActive());
        existingWorkflow.setTags(updateDto.getTags());
        existingWorkflow.setCategory(updateDto.getCategory());
        existingWorkflow.setLastModifiedBy(updateDto.getLastModifiedBy());
        
        // Increment version
        existingWorkflow.setVersion(existingWorkflow.getVersion() + 1);
        
        Workflow savedWorkflow = workflowRepository.save(existingWorkflow);
        
        log.info("Workflow updated successfully with id: {}", savedWorkflow.getId());
        return workflowMapper.toDto(savedWorkflow);
    }
    
    public void deleteWorkflow(Long id) {
        log.info("Deleting workflow with id: {}", id);
        
        if (!workflowRepository.existsById(id)) {
            throw new IllegalArgumentException("Workflow not found with id: " + id);
        }
        
        workflowRepository.deleteById(id);
        log.info("Workflow deleted successfully with id: {}", id);
    }
    
    public WorkflowDto toggleActiveStatus(Long id) {
        log.info("Toggling active status for workflow with id: {}", id);
        
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found with id: " + id));
        
        workflow.setIsActive(!workflow.getIsActive());
        workflow.setVersion(workflow.getVersion() + 1);
        
        Workflow savedWorkflow = workflowRepository.save(workflow);
        
        log.info("Workflow active status toggled successfully for id: {}. New status: {}", 
                 savedWorkflow.getId(), savedWorkflow.getIsActive());
        return workflowMapper.toDto(savedWorkflow);
    }
    
    public WorkflowDto incrementExecutionCount(Long id) {
        log.info("Incrementing execution count for workflow with id: {}", id);
        
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found with id: " + id));
        
        workflow.setExecutionCount(workflow.getExecutionCount() + 1);
        workflow.setLastExecutedAt(LocalDateTime.now());
        
        Workflow savedWorkflow = workflowRepository.save(workflow);
        
        log.info("Workflow execution count incremented successfully for id: {}. New count: {}", 
                 savedWorkflow.getId(), savedWorkflow.getExecutionCount());
        return workflowMapper.toDto(savedWorkflow);
    }
    
    public boolean existsByName(String name) {
        return workflowRepository.existsByNameIgnoreCase(name);
    }
} 