package com.example.agentprovider.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class AppConfig {

    private static final Logger logger = LoggerFactory.getLogger(AppConfig.class);
    
    @Value("${ai-provider.url}")
    private String aiProviderUrl;
    
    @PostConstruct
    public void init() {
        String trimmedUrl = aiProviderUrl.trim();
        
        logger.info("Original AI Provider URL: '{}'", aiProviderUrl);
        logger.info("Trimmed AI Provider URL: '{}'", trimmedUrl);
        logger.info("URL char codes: {}", getCharCodes(aiProviderUrl));
        
        if (!aiProviderUrl.equals(trimmedUrl)) {
            logger.warn("AI Provider URL contains leading or trailing whitespace characters!");
        }
    }
    
    private String getCharCodes(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            sb.append((int) c).append(" ");
        }
        return sb.toString();
    }
} 