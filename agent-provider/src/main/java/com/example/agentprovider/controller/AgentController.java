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
import com.example.agentprovider.model.DataAnalyserRequest;
import com.example.agentprovider.model.DataAnalyserResponse;
import com.example.agentprovider.service.DataAnalyserService;
import com.example.agentprovider.model.ImageGeneratorRequest;
import com.example.agentprovider.model.ImageGeneratorResponse;
import com.example.agentprovider.service.ImageGeneratorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.core.JsonProcessingException;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final YoutubeService youtubeService;
    private final WebScrapperService webScrapperService;
    private final WebSearcherService webSearcherService;
    private final TranslatorService translatorService;
    private final DataAnalyserService dataAnalyserService;
    private final ImageGeneratorService imageGeneratorService;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public AgentController(YoutubeService youtubeService, WebScrapperService webScrapperService, 
                         WebSearcherService webSearcherService, TranslatorService translatorService,
                         DataAnalyserService dataAnalyserService, ImageGeneratorService imageGeneratorService) {
        this.youtubeService = youtubeService;
        this.webScrapperService = webScrapperService;
        this.webSearcherService = webSearcherService;
        this.translatorService = translatorService;
        this.dataAnalyserService = dataAnalyserService;
        this.imageGeneratorService = imageGeneratorService;
        
        this.objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
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

    @PostMapping(value = "/data-analyser", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DataAnalyserResponse> analyseData(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("request") String requestJson) {
        try {
            System.out.println("Received request JSON: " + requestJson);
            
            // Create a new instance and set properties manually
            DataAnalyserRequest request = new DataAnalyserRequest();
            Map<String, Object> jsonMap = objectMapper.readValue(requestJson, Map.class);
            
            // Set parent class properties
            request.setContent((String) jsonMap.get("content"));
            request.setSpecialPrompt((String) jsonMap.get("specialPrompt"));
            request.setModel((String) jsonMap.get("model"));
            request.setMaxTokens((Integer) jsonMap.get("maxTokens"));
            request.setTemperature(((Number) jsonMap.get("temperature")).doubleValue());
            
            // Set child class properties
            request.setXAxis((String) jsonMap.get("xAxis"));
            request.setYAxis((String) jsonMap.get("yAxis"));
            
            System.out.println("Created request object: " + request);
            
            DataAnalyserResponse response = dataAnalyserService.analyseData(file, request);
            return ResponseEntity.ok(response);
        } catch (JsonProcessingException e) {
            System.err.println("JSON Processing Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("General Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/image-generator")
    public ResponseEntity<ImageGeneratorResponse> generateImage(@RequestBody ImageGeneratorRequest request) {
        ImageGeneratorResponse response = imageGeneratorService.generateImage(request);
        return ResponseEntity.ok(response);
    }
} 