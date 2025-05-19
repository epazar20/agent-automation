package com.example.agentprovider.model.youtubeTranscript;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TranscriptResponse {
    private String title;
    private String description;
    private List<String> availableLangs;
    private String lengthInSeconds;
    private List<Thumbnail> thumbnails;
    private List<TranscriptionSegment> transcription;
    private String transcriptionAsText;
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Thumbnail {
        private String url;
        private int width;
        private int height;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TranscriptionSegment {
        private String subtitle;
        private double start;
        private double dur;
    }
} 