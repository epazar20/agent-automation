package com.example.agentprovider.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YoutubeSummarizeResponse {
    
    private String videoId;
    
    private String content;
    
    private String model;
    
    private long processingTimeMs;
    
    @Builder.Default
    private boolean success = true;
    
    private String errorMessage;
} 