package com.example.mcpprovider.controller;

import com.example.mcpprovider.dto.ActionAnalysisRequest;
import com.example.mcpprovider.dto.ActionAnalysisResponse;
import com.example.mcpprovider.service.ActionAnalysisService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/action-analysis")
@CrossOrigin(origins = "*")
public class ActionAnalysisController {

    @Autowired
    private ActionAnalysisService actionAnalysisService;

    @PostMapping
    public ResponseEntity<ActionAnalysisResponse> analyzeAction(@Valid @RequestBody ActionAnalysisRequest request) {
        try {
            if (request == null || request.getContent() == null || request.getContent().trim().isEmpty()) {
                throw new IllegalArgumentException("Request content cannot be empty");
            }

            ActionAnalysisResponse response = actionAnalysisService.analyzeAction(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ActionAnalysisResponse errorResponse = new ActionAnalysisResponse();
            errorResponse.setContent("Error: " + e.getMessage());
            errorResponse.setOriginalContent(request != null ? request.getContent() : "");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Action Analysis Service is running");
    }
} 