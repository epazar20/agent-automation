package com.example.aiprovider.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class HuggingFaceResponse {
    private Choice[] choices;
    
    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Choice {
        private Message message;
        private String finish_reason;
        private int index;
    }
    
    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {
        private String role;
        private String content;
    }
} 