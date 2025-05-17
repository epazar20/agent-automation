package com.example.agentprovider.client;

import com.example.agentprovider.model.TranscriptResponse;
import com.example.agentprovider.model.TranscriptResponse.TranscriptionSegment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class YoutubeTranscriptorClient {

    private static final Logger logger = LoggerFactory.getLogger(YoutubeTranscriptorClient.class);
    private final WebClient webClient;
    
    public YoutubeTranscriptorClient(
            WebClient.Builder webClientBuilder,
            @Value("${rapidapi.youtube-transcriptor.url:https://youtube-transcriptor.p.rapidapi.com}") String baseUrl,
            @Value("${rapidapi.youtube-transcriptor.key:b7d4079946mshbb999089780ff69p1db92fjsn99670ce74944}") String apiKey,
            @Value("${rapidapi.youtube-transcriptor.host:youtube-transcriptor.p.rapidapi.com}") String apiHost) {
        
        this.webClient = webClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("X-RapidAPI-Key", apiKey)
                .defaultHeader("X-RapidAPI-Host", apiHost)
                .build();
    }
    
    /**
     * Fetches transcript for a YouTube video
     * @param videoId The YouTube video ID
     * @return The transcript response
     */
    public List<TranscriptResponse> getTranscript(String videoId) {
        try {
            // The API now returns a list of TranscriptResponse objects
            List<TranscriptResponse> responses = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/transcript")
                            .queryParam("video_id", videoId)
                            .build())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<TranscriptResponse>>() {})
                    .block();
            
            if (responses == null || responses.isEmpty()) {
                logger.warn("No transcript found for video ID: {}", videoId);
                return Collections.emptyList();
            }
            
            return responses;
        } catch (Exception e) {
            logger.error("Error getting transcript for video ID {}: {}", videoId, e.getMessage(), e);
            throw e;
        }
    }
} 