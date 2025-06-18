package com.example.mcpprovider.mapper;

import com.example.mcpprovider.dto.WorkflowDto;
import com.example.mcpprovider.dto.WorkflowCreateDto;
import com.example.mcpprovider.dto.WorkflowSummaryDto;
import com.example.mcpprovider.entity.Workflow;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class WorkflowMapper {
    
    public WorkflowDto toDto(Workflow workflow) {
        if (workflow == null) {
            return null;
        }
        
        WorkflowDto dto = new WorkflowDto();
        dto.setId(workflow.getId());
        dto.setName(workflow.getName());
        dto.setDescription(workflow.getDescription());
        dto.setNodesData(workflow.getNodesData());
        dto.setEdgesData(workflow.getEdgesData());
        dto.setVersion(workflow.getVersion());
        dto.setIsActive(workflow.getIsActive());
        dto.setTags(workflow.getTags());
        dto.setCategory(workflow.getCategory());
        dto.setCreatedBy(workflow.getCreatedBy());
        dto.setLastModifiedBy(workflow.getLastModifiedBy());
        dto.setExecutionCount(workflow.getExecutionCount());
        dto.setLastExecutedAt(workflow.getLastExecutedAt());
        dto.setCreatedAt(workflow.getCreatedAt());
        dto.setUpdatedAt(workflow.getUpdatedAt());
        
        return dto;
    }
    
    public WorkflowSummaryDto toSummaryDto(Workflow workflow) {
        if (workflow == null) {
            return null;
        }
        
        WorkflowSummaryDto dto = new WorkflowSummaryDto();
        dto.setId(workflow.getId());
        dto.setName(workflow.getName());
        dto.setDescription(workflow.getDescription());
        dto.setVersion(workflow.getVersion());
        dto.setIsActive(workflow.getIsActive());
        dto.setTags(workflow.getTags());
        dto.setCategory(workflow.getCategory());
        dto.setCreatedBy(workflow.getCreatedBy());
        dto.setExecutionCount(workflow.getExecutionCount());
        dto.setLastExecutedAt(workflow.getLastExecutedAt());
        dto.setCreatedAt(workflow.getCreatedAt());
        dto.setUpdatedAt(workflow.getUpdatedAt());
        
        return dto;
    }
    
    public Workflow toEntity(WorkflowCreateDto createDto) {
        if (createDto == null) {
            return null;
        }
        
        Workflow workflow = new Workflow();
        workflow.setName(createDto.getName());
        workflow.setDescription(createDto.getDescription());
        workflow.setNodesData(createDto.getNodesData());
        workflow.setEdgesData(createDto.getEdgesData());
        workflow.setVersion(1);
        workflow.setIsActive(true);
        workflow.setTags(createDto.getTags());
        workflow.setCategory(createDto.getCategory());
        workflow.setCreatedBy(createDto.getCreatedBy());
        workflow.setLastModifiedBy(createDto.getCreatedBy());
        workflow.setExecutionCount(0L);
        
        return workflow;
    }
    
    public Workflow toEntity(WorkflowDto dto) {
        if (dto == null) {
            return null;
        }
        
        Workflow workflow = new Workflow();
        workflow.setId(dto.getId());
        workflow.setName(dto.getName());
        workflow.setDescription(dto.getDescription());
        workflow.setNodesData(dto.getNodesData());
        workflow.setEdgesData(dto.getEdgesData());
        workflow.setVersion(dto.getVersion());
        workflow.setIsActive(dto.getIsActive());
        workflow.setTags(dto.getTags());
        workflow.setCategory(dto.getCategory());
        workflow.setCreatedBy(dto.getCreatedBy());
        workflow.setLastModifiedBy(dto.getLastModifiedBy());
        workflow.setExecutionCount(dto.getExecutionCount());
        workflow.setLastExecutedAt(dto.getLastExecutedAt());
        
        return workflow;
    }
    
    public List<WorkflowDto> toDtoList(List<Workflow> workflows) {
        return workflows.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public List<WorkflowSummaryDto> toSummaryDtoList(List<Workflow> workflows) {
        return workflows.stream()
                .map(this::toSummaryDto)
                .collect(Collectors.toList());
    }
} 