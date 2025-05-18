package com.example.agentprovider.client;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class YoutubeTranscriptorConfig {

    @Value("${rapidapi.youtube.transcriptor.key}")
    private String apiKey;

    @Value("${rapidapi.youtube-transcriptor.host}")
    private String apiHost;

    @Bean
    public RequestInterceptor rapidApiInterceptor() {
        return requestTemplate -> {
            requestTemplate.header("X-RapidAPI-Key", apiKey);
            requestTemplate.header("X-RapidAPI-Host", apiHost);
        };
    }
} 