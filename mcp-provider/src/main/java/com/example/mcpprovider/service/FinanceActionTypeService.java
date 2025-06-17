package com.example.mcpprovider.service;

import com.example.mcpprovider.dto.FinanceActionTypeDto;
import com.example.mcpprovider.dto.FinanceActionTypeCreateDto;
import com.example.mcpprovider.entity.FinanceActionType;
import com.example.mcpprovider.mapper.FinanceActionTypeMapper;
import com.example.mcpprovider.repository.FinanceActionTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FinanceActionTypeService {
    
    private final FinanceActionTypeRepository financeActionTypeRepository;
    private final FinanceActionTypeMapper financeActionTypeMapper;
    
    @Transactional(readOnly = true)
    public List<FinanceActionTypeDto> getAllFinanceActionTypes() {
        log.debug("Getting all finance action types");
        List<FinanceActionType> actionTypes = financeActionTypeRepository.findAll();
        return financeActionTypeMapper.toDtoList(actionTypes);
    }
    
    @Transactional(readOnly = true)
    public List<FinanceActionTypeDto> getActiveFinanceActionTypes() {
        log.debug("Getting active finance action types");
        List<FinanceActionType> actionTypes = financeActionTypeRepository.findByIsActiveTrueOrderBySortOrderAsc();
        return financeActionTypeMapper.toDtoList(actionTypes);
    }
    
    @Transactional(readOnly = true)
    public Optional<FinanceActionTypeDto> getFinanceActionTypeById(Long id) {
        log.debug("Getting finance action type by id: {}", id);
        Optional<FinanceActionType> actionType = financeActionTypeRepository.findById(id);
        return actionType.map(financeActionTypeMapper::toDto);
    }
    
    @Transactional(readOnly = true)
    public Optional<FinanceActionTypeDto> getFinanceActionTypeByCode(String typeCode) {
        log.debug("Getting finance action type by code: {}", typeCode);
        Optional<FinanceActionType> actionType = financeActionTypeRepository.findByTypeCode(typeCode);
        return actionType.map(financeActionTypeMapper::toDto);
    }
    
    @Transactional(readOnly = true)
    public Optional<FinanceActionTypeDto> getFinanceActionTypeByEndpointPath(String endpointPath) {
        log.debug("Getting finance action type by endpoint path: {}", endpointPath);
        Optional<FinanceActionType> actionType = financeActionTypeRepository.findByEndpointPath(endpointPath);
        return actionType.map(financeActionTypeMapper::toDto);
    }
    
    @Transactional(readOnly = true)
    public List<FinanceActionTypeDto> searchFinanceActionTypesByName(String name) {
        log.debug("Searching finance action types by name: {}", name);
        List<FinanceActionType> actionTypes = financeActionTypeRepository.findByTypeNameContaining(name);
        return financeActionTypeMapper.toDtoList(actionTypes);
    }
    
    public FinanceActionTypeDto createFinanceActionType(FinanceActionTypeCreateDto createDto) {
        log.debug("Creating new finance action type: {}", createDto.getTypeCode());
        
        // Check if type code already exists
        if (financeActionTypeRepository.existsByTypeCode(createDto.getTypeCode())) {
            throw new IllegalArgumentException("Finance action type with code '" + createDto.getTypeCode() + "' already exists");
        }
        
        // Check if endpoint path already exists
        if (financeActionTypeRepository.existsByEndpointPath(createDto.getEndpointPath())) {
            throw new IllegalArgumentException("Finance action type with endpoint path '" + createDto.getEndpointPath() + "' already exists");
        }
        
        FinanceActionType entity = financeActionTypeMapper.toEntity(createDto);
        FinanceActionType savedEntity = financeActionTypeRepository.save(entity);
        
        log.info("Created finance action type with id: {}", savedEntity.getId());
        return financeActionTypeMapper.toDto(savedEntity);
    }
    
    public FinanceActionTypeDto updateFinanceActionType(Long id, FinanceActionTypeDto dto) {
        log.debug("Updating finance action type: {}", id);
        
        FinanceActionType existingEntity = financeActionTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Finance action type not found with id: " + id));
        
        // Check if type code conflicts with another record
        if (!existingEntity.getTypeCode().equals(dto.getTypeCode())) {
            if (financeActionTypeRepository.existsByTypeCode(dto.getTypeCode())) {
                throw new IllegalArgumentException("Finance action type with code '" + dto.getTypeCode() + "' already exists");
            }
        }
        
        // Check if endpoint path conflicts with another record
        if (!existingEntity.getEndpointPath().equals(dto.getEndpointPath())) {
            if (financeActionTypeRepository.existsByEndpointPath(dto.getEndpointPath())) {
                throw new IllegalArgumentException("Finance action type with endpoint path '" + dto.getEndpointPath() + "' already exists");
            }
        }
        
        financeActionTypeMapper.updateEntityFromDto(existingEntity, dto);
        FinanceActionType savedEntity = financeActionTypeRepository.save(existingEntity);
        
        log.info("Updated finance action type with id: {}", savedEntity.getId());
        return financeActionTypeMapper.toDto(savedEntity);
    }
    
    public void deleteFinanceActionType(Long id) {
        log.debug("Deleting finance action type: {}", id);
        
        if (!financeActionTypeRepository.existsById(id)) {
            throw new IllegalArgumentException("Finance action type not found with id: " + id);
        }
        
        financeActionTypeRepository.deleteById(id);
        log.info("Deleted finance action type with id: {}", id);
    }
    
    public FinanceActionTypeDto toggleActiveStatus(Long id) {
        log.debug("Toggling active status for finance action type: {}", id);
        
        FinanceActionType entity = financeActionTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Finance action type not found with id: " + id));
        
        entity.setIsActive(!entity.getIsActive());
        FinanceActionType savedEntity = financeActionTypeRepository.save(entity);
        
        log.info("Toggled active status for finance action type {} to: {}", id, savedEntity.getIsActive());
        return financeActionTypeMapper.toDto(savedEntity);
    }
    
    @Transactional(readOnly = true)
    public boolean existsByTypeCode(String typeCode) {
        return financeActionTypeRepository.existsByTypeCode(typeCode);
    }
    
    @Transactional(readOnly = true)
    public boolean existsByEndpointPath(String endpointPath) {
        return financeActionTypeRepository.existsByEndpointPath(endpointPath);
    }
} 