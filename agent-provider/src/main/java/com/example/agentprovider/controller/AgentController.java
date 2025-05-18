package com.example.agentprovider.controller;

import com.example.agentprovider.model.YoutubeSummarizeRequest;
import com.example.agentprovider.model.YoutubeSummarizeResponse;
import com.example.agentprovider.service.YoutubeService;
import com.example.agentprovider.service.TranslatorService;
import com.example.agentprovider.model.WebScrapperRequest;
import com.example.agentprovider.model.WebScrapperResponse;
import com.example.agentprovider.service.WebScrapperService;
import com.example.agentprovider.model.WebSearcherRequest;
import com.example.agentprovider.model.WebSearcherResponse;
import com.example.agentprovider.service.WebSearcherService;
import com.example.agentprovider.model.TranslatorRequest;
import com.example.agentprovider.model.TranslatorResponse;

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
    private final WebScrapperService webScrapperService;
    private final WebSearcherService webSearcherService;
    private final TranslatorService translatorService;
    
    @Autowired
    public AgentController(YoutubeService youtubeService, WebScrapperService webScrapperService, 
                         WebSearcherService webSearcherService, TranslatorService translatorService) {
        this.youtubeService = youtubeService;
        this.webScrapperService = webScrapperService;
        this.webSearcherService = webSearcherService;
        this.translatorService = translatorService;
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

    @PostMapping("/web-scrapper")
    public ResponseEntity<WebScrapperResponse> webScrapper(@RequestBody WebScrapperRequest request) {
        WebScrapperResponse response = webScrapperService.processWebScrapper(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/web-searcher")
    public ResponseEntity<WebSearcherResponse> webSearcher(@RequestBody WebSearcherRequest request) {
        WebSearcherResponse response = webSearcherService.search(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/translator")
    public ResponseEntity<TranslatorResponse> translate(@RequestBody TranslatorRequest request) {
        TranslatorResponse response = translatorService.translate(request);
        return ResponseEntity.ok(response);
    }
} 