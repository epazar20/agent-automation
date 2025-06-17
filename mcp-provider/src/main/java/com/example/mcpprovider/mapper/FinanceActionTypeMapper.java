package com.example.mcpprovider.mapper;

import com.example.mcpprovider.dto.FinanceActionTypeDto;
import com.example.mcpprovider.dto.FinanceActionTypeCreateDto;
import com.example.mcpprovider.entity.FinanceActionType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FinanceActionTypeMapper {
    
    public FinanceActionTypeDto toDto(FinanceActionType entity) {
        if (entity == null) {
            return null;
        }
        
        return FinanceActionTypeDto.builder()
                .id(entity.getId())
                .typeCode(entity.getTypeCode())
                .typeName(entity.getTypeName())
                .description(entity.getDescription())
                .samplePrompt(entity.getSamplePrompt())
                .endpointPath(entity.getEndpointPath())
                .jsonSchema(entity.getJsonSchema())
                .isActive(entity.getIsActive())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    public FinanceActionType toEntity(FinanceActionTypeCreateDto createDto) {
        if (createDto == null) {
            return null;
        }
        
        FinanceActionType entity = new FinanceActionType();
        entity.setTypeCode(createDto.getTypeCode());
        entity.setTypeName(createDto.getTypeName());
        entity.setDescription(createDto.getDescription());
        entity.setSamplePrompt(createDto.getSamplePrompt());
        entity.setEndpointPath(createDto.getEndpointPath());
        entity.setJsonSchema(createDto.getJsonSchema());
        entity.setIsActive(createDto.getIsActive());
        entity.setSortOrder(createDto.getSortOrder());
        
        return entity;
    }
    
    public FinanceActionType toEntity(FinanceActionTypeDto dto) {
        if (dto == null) {
            return null;
        }
        
        FinanceActionType entity = new FinanceActionType();
        entity.setId(dto.getId());
        entity.setTypeCode(dto.getTypeCode());
        entity.setTypeName(dto.getTypeName());
        entity.setDescription(dto.getDescription());
        entity.setSamplePrompt(dto.getSamplePrompt());
        entity.setEndpointPath(dto.getEndpointPath());
        entity.setJsonSchema(dto.getJsonSchema());
        entity.setIsActive(dto.getIsActive());
        entity.setSortOrder(dto.getSortOrder());
        
        return entity;
    }
    
    public List<FinanceActionTypeDto> toDtoList(List<FinanceActionType> entities) {
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public void updateEntityFromDto(FinanceActionType entity, FinanceActionTypeDto dto) {
        if (entity == null || dto == null) {
            return;
        }
        
        entity.setTypeCode(dto.getTypeCode());
        entity.setTypeName(dto.getTypeName());
        entity.setDescription(dto.getDescription());
        entity.setSamplePrompt(dto.getSamplePrompt());
        entity.setEndpointPath(dto.getEndpointPath());
        entity.setJsonSchema(dto.getJsonSchema());
        entity.setIsActive(dto.getIsActive());
        entity.setSortOrder(dto.getSortOrder());
    }
} 