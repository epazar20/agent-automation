package com.example.agentprovider.controller;

import com.example.agentprovider.model.YoutubeSummarizeRequest;
import com.example.agentprovider.model.YoutubeSummarizeResponse;
import com.example.agentprovider.service.YoutubeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final YoutubeService youtubeService;
    
    @Autowired
    public AgentController(YoutubeService youtubeService) {
        this.youtubeService = youtubeService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getStatus() {
        Map<String, String> response = new HashMap<>();
        response.put("service", "agent-provider");
        response.put("status", "running");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/youtube-summarize")
    public ResponseEntity<YoutubeSummarizeResponse> summarizeYoutubeVideo(@RequestBody YoutubeSummarizeRequest request) {
        YoutubeSummarizeResponse response = youtubeService.summarizeVideo(request);
        return ResponseEntity.ok(response);
    }
} 