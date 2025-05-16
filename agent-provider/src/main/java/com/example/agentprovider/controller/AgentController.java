package com.example.agentprovider.controller;

import com.example.agentprovider.model.YoutubeSummarizeRequest;
import com.example.agentprovider.model.YoutubeSummarizeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getStatus() {
        Map<String, String> response = new HashMap<>();
        response.put("service", "agent-provider");
        response.put("status", "running");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/youtube-summarize")
    public ResponseEntity<YoutubeSummarizeResponse> summarizeYoutubeVideo(@RequestBody YoutubeSummarizeRequest request) {
        // Extract the video ID from the YouTube URL
        String videoId = extractYoutubeVideoId(request.getUrl());
        
        // In a real implementation, you would call a service to handle the summarization
        // For now, return a dummy response
        YoutubeSummarizeResponse response = YoutubeSummarizeResponse.builder()
                .videoId(videoId)
                .summaryContent("This is a dummy summary for the video with ID: " + videoId)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    private String extractYoutubeVideoId(String url) {
        String videoId = "";
        
        // Regular expression pattern to extract YouTube video ID
        String pattern = "(?<=watch\\?v=|/videos/|embed\\/|youtu.be\\/|\\/v\\/|\\/e\\/|watch\\?v%3D|watch\\?feature=player_embedded&v=|%2Fvideos%2F|embed%\u200C\u200B2F|youtu.be%2F|%2Fv%2F)[^#\\&\\?\\n]*";
        
        Pattern compiledPattern = Pattern.compile(pattern);
        Matcher matcher = compiledPattern.matcher(url);
        
        if (matcher.find()) {
            videoId = matcher.group();
        }
        
        return videoId;
    }
} 