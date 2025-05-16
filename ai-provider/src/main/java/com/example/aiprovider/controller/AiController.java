package com.example.aiprovider.controller;

import com.example.aiprovider.model.AiRequest;
import com.example.aiprovider.model.AiResponse;
import com.example.aiprovider.service.AiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    
    @Autowired
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate")
    public ResponseEntity<AiResponse> generateContent(@Valid @RequestBody AiRequest request) {
        return ResponseEntity.ok(aiService.processRequest(request));
    }
    
    @GetMapping("/models")
    public ResponseEntity<String[]> listModels() {
        return ResponseEntity.ok(aiService.listAvailableModels());
    }
} 