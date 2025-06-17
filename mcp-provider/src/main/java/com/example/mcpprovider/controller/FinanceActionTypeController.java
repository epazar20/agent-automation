package com.example.mcpprovider.controller;

import com.example.mcpprovider.dto.FinanceActionTypeDto;
import com.example.mcpprovider.dto.FinanceActionTypeCreateDto;
import com.example.mcpprovider.service.FinanceActionTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/finance-action-types")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FinanceActionTypeController {
    
    private final FinanceActionTypeService financeActionTypeService;
    
    @GetMapping
    public ResponseEntity<List<FinanceActionTypeDto>> getAllFinanceActionTypes() {
        log.info("GET /api/finance-action-types - Getting all finance action types");
        List<FinanceActionTypeDto> actionTypes = financeActionTypeService.getAllFinanceActionTypes();
        return ResponseEntity.ok(actionTypes);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<FinanceActionTypeDto>> getActiveFinanceActionTypes() {
        log.info("GET /api/finance-action-types/active - Getting active finance action types");
        List<FinanceActionTypeDto> actionTypes = financeActionTypeService.getActiveFinanceActionTypes();
        return ResponseEntity.ok(actionTypes);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FinanceActionTypeDto> getFinanceActionTypeById(@PathVariable Long id) {
        log.info("GET /api/finance-action-types/{} - Getting finance action type by id", id);
        Optional<FinanceActionTypeDto> actionType = financeActionTypeService.getFinanceActionTypeById(id);
        return actionType.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/code/{typeCode}")
    public ResponseEntity<FinanceActionTypeDto> getFinanceActionTypeByCode(@PathVariable String typeCode) {
        log.info("GET /api/finance-action-types/code/{} - Getting finance action type by code", typeCode);
        Optional<FinanceActionTypeDto> actionType = financeActionTypeService.getFinanceActionTypeByCode(typeCode);
        return actionType.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/endpoint")
    public ResponseEntity<FinanceActionTypeDto> getFinanceActionTypeByEndpointPath(@RequestParam String endpointPath) {
        log.info("GET /api/finance-action-types/endpoint - Getting finance action type by endpoint path: {}", endpointPath);
        Optional<FinanceActionTypeDto> actionType = financeActionTypeService.getFinanceActionTypeByEndpointPath(endpointPath);
        return actionType.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<FinanceActionTypeDto>> searchFinanceActionTypesByName(@RequestParam String name) {
        log.info("GET /api/finance-action-types/search - Searching finance action types by name: {}", name);
        List<FinanceActionTypeDto> actionTypes = financeActionTypeService.searchFinanceActionTypesByName(name);
        return ResponseEntity.ok(actionTypes);
    }
    
    @PostMapping
    public ResponseEntity<FinanceActionTypeDto> createFinanceActionType(@Valid @RequestBody FinanceActionTypeCreateDto createDto) {
        log.info("POST /api/finance-action-types - Creating new finance action type: {}", createDto.getTypeCode());
        
        try {
            FinanceActionTypeDto createdActionType = financeActionTypeService.createFinanceActionType(createDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdActionType);
        } catch (IllegalArgumentException e) {
            log.error("Error creating finance action type: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FinanceActionTypeDto> updateFinanceActionType(
            @PathVariable Long id, 
            @Valid @RequestBody FinanceActionTypeDto dto) {
        log.info("PUT /api/finance-action-types/{} - Updating finance action type", id);
        
        try {
            FinanceActionTypeDto updatedActionType = financeActionTypeService.updateFinanceActionType(id, dto);
            return ResponseEntity.ok(updatedActionType);
        } catch (IllegalArgumentException e) {
            log.error("Error updating finance action type: {}", e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }
    }
    
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<FinanceActionTypeDto> toggleActiveStatus(@PathVariable Long id) {
        log.info("PATCH /api/finance-action-types/{}/toggle-active - Toggling active status", id);
        
        try {
            FinanceActionTypeDto updatedActionType = financeActionTypeService.toggleActiveStatus(id);
            return ResponseEntity.ok(updatedActionType);
        } catch (IllegalArgumentException e) {
            log.error("Error toggling active status: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFinanceActionType(@PathVariable Long id) {
        log.info("DELETE /api/finance-action-types/{} - Deleting finance action type", id);
        
        try {
            financeActionTypeService.deleteFinanceActionType(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting finance action type: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/check/code/{typeCode}")
    public ResponseEntity<Boolean> checkTypeCodeExists(@PathVariable String typeCode) {
        log.info("GET /api/finance-action-types/check/code/{} - Checking if type code exists", typeCode);
        boolean exists = financeActionTypeService.existsByTypeCode(typeCode);
        return ResponseEntity.ok(exists);
    }
    
    @GetMapping("/check/endpoint")
    public ResponseEntity<Boolean> checkEndpointPathExists(@RequestParam String endpointPath) {
        log.info("GET /api/finance-action-types/check/endpoint - Checking if endpoint path exists: {}", endpointPath);
        boolean exists = financeActionTypeService.existsByEndpointPath(endpointPath);
        return ResponseEntity.ok(exists);
    }
} 