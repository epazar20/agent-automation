package com.example.mcpprovider.controller;

import com.example.mcpprovider.dto.WorkflowDto;
import com.example.mcpprovider.dto.WorkflowCreateDto;
import com.example.mcpprovider.dto.WorkflowSummaryDto;
import com.example.mcpprovider.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class WorkflowController {
    
    private final WorkflowService workflowService;
    
    @GetMapping
    public ResponseEntity<List<WorkflowSummaryDto>> getAllWorkflows() {
        log.info("GET /api/workflows - Getting all workflows");
        List<WorkflowSummaryDto> workflows = workflowService.getAllWorkflows();
        return ResponseEntity.ok(workflows);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<WorkflowSummaryDto>> getActiveWorkflows() {
        log.info("GET /api/workflows/active - Getting active workflows");
        List<WorkflowSummaryDto> workflows = workflowService.getActiveWorkflows();
        return ResponseEntity.ok(workflows);
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<WorkflowSummaryDto>> getRecentWorkflows() {
        log.info("GET /api/workflows/recent - Getting recent workflows");
        List<WorkflowSummaryDto> workflows = workflowService.getRecentWorkflows();
        return ResponseEntity.ok(workflows);
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<WorkflowSummaryDto>> getPopularWorkflows() {
        log.info("GET /api/workflows/popular - Getting popular workflows");
        List<WorkflowSummaryDto> workflows = workflowService.getPopularWorkflows();
        return ResponseEntity.ok(workflows);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<WorkflowDto> getWorkflowById(@PathVariable Long id) {
        log.info("GET /api/workflows/{} - Getting workflow by id", id);
        Optional<WorkflowDto> workflow = workflowService.getWorkflowById(id);
        return workflow.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<WorkflowDto> getWorkflowByName(@PathVariable String name) {
        log.info("GET /api/workflows/name/{} - Getting workflow by name", name);
        Optional<WorkflowDto> workflow = workflowService.getWorkflowByName(name);
        return workflow.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<WorkflowSummaryDto>> getWorkflowsByCategory(@PathVariable String category) {
        log.info("GET /api/workflows/category/{} - Getting workflows by category", category);
        List<WorkflowSummaryDto> workflows = workflowService.getWorkflowsByCategory(category);
        return ResponseEntity.ok(workflows);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<WorkflowSummaryDto>> searchWorkflows(@RequestParam String q) {
        log.info("GET /api/workflows/search - Searching workflows with query: {}", q);
        List<WorkflowSummaryDto> workflows = workflowService.searchWorkflows(q);
        return ResponseEntity.ok(workflows);
    }
    
    @PostMapping
    public ResponseEntity<WorkflowDto> createWorkflow(@Valid @RequestBody WorkflowCreateDto createDto) {
        log.info("POST /api/workflows - Creating workflow: {}", createDto.getName());
        
        try {
            WorkflowDto createdWorkflow = workflowService.createWorkflow(createDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdWorkflow);
        } catch (IllegalArgumentException e) {
            log.error("Error creating workflow: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<WorkflowDto> updateWorkflow(
            @PathVariable Long id, 
            @Valid @RequestBody WorkflowDto updateDto) {
        log.info("PUT /api/workflows/{} - Updating workflow", id);
        
        try {
            WorkflowDto updatedWorkflow = workflowService.updateWorkflow(id, updateDto);
            return ResponseEntity.ok(updatedWorkflow);
        } catch (IllegalArgumentException e) {
            log.error("Error updating workflow: {}", e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }
    }
    
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<WorkflowDto> toggleActiveStatus(@PathVariable Long id) {
        log.info("PATCH /api/workflows/{}/toggle-active - Toggling active status", id);
        
        try {
            WorkflowDto updatedWorkflow = workflowService.toggleActiveStatus(id);
            return ResponseEntity.ok(updatedWorkflow);
        } catch (IllegalArgumentException e) {
            log.error("Error toggling active status: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/increment-execution")
    public ResponseEntity<WorkflowDto> incrementExecutionCount(@PathVariable Long id) {
        log.info("PATCH /api/workflows/{}/increment-execution - Incrementing execution count", id);
        
        try {
            WorkflowDto updatedWorkflow = workflowService.incrementExecutionCount(id);
            return ResponseEntity.ok(updatedWorkflow);
        } catch (IllegalArgumentException e) {
            log.error("Error incrementing execution count: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long id) {
        log.info("DELETE /api/workflows/{} - Deleting workflow", id);
        
        try {
            workflowService.deleteWorkflow(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting workflow: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/check/name/{name}")
    public ResponseEntity<Boolean> checkWorkflowNameExists(@PathVariable String name) {
        log.info("GET /api/workflows/check/name/{} - Checking if workflow name exists", name);
        boolean exists = workflowService.existsByName(name);
        return ResponseEntity.ok(exists);
    }
} 