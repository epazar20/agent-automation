package com.example.aiprovider.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ArrayNode;

/**
 * Model class for HuggingFace API requests
 */
public class HuggingFaceRequest {
    
    private ArrayNode messages;
    private String model;
    
    @JsonProperty("max_tokens")
    private Integer max_tokens;
    
    private Double temperature;
    
    public HuggingFaceRequest() {
    }
    
    public ArrayNode getMessages() {
        return messages;
    }
    
    public void setMessages(ArrayNode messages) {
        this.messages = messages;
    }
    
    public String getModel() {
        return model;
    }
    
    public void setModel(String model) {
        this.model = model;
    }
    
    public Integer getMax_tokens() {
        return max_tokens;
    }
    
    public void setMax_tokens(Integer max_tokens) {
        this.max_tokens = max_tokens;
    }
    
    public Double getTemperature() {
        return temperature;
    }
    
    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }
} 