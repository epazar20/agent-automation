package com.example.aiprovider.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Utility class to handle JSON string escaping and validation
 */
public class JsonEscapeHelper {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Escapes special characters in a string to make it safe for JSON
     * 
     * @param input The string to escape
     * @return JSON-safe escaped string
     */
    public static String escapeJsonString(String input) {
        if (input == null) {
            return null;
        }
        
        try {
            // Using Jackson's ObjectMapper to properly escape the string
            return objectMapper.writeValueAsString(input).replace("\"", "\\\"");
        } catch (JsonProcessingException e) {
            // If there's an error, provide a basic fallback implementation
            return basicEscapeJson(input);
        }
    }
    
    /**
     * Basic fallback implementation of JSON escaping
     */
    private static String basicEscapeJson(String input) {
        if (input == null) {
            return null;
        }
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            switch (c) {
                case '"':
                    sb.append("\\\"");
                    break;
                case '\\':
                    sb.append("\\\\");
                    break;
                case '/':
                    sb.append("\\/");
                    break;
                case '\b':
                    sb.append("\\b");
                    break;
                case '\f':
                    sb.append("\\f");
                    break;
                case '\n':
                    sb.append("\\n");
                    break;
                case '\r':
                    sb.append("\\r");
                    break;
                case '\t':
                    sb.append("\\t");
                    break;
                default:
                    // Handle unicode characters
                    if (c < ' ') {
                        String hexString = Integer.toHexString(c);
                        sb.append("\\u");
                        for (int j = 0; j < 4 - hexString.length(); j++) {
                            sb.append('0');
                        }
                        sb.append(hexString);
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }
    
    /**
     * Validates if a string represents valid JSON
     * 
     * @param jsonString String to validate as JSON
     * @return true if valid JSON, false otherwise
     */
    public static boolean isValidJson(String jsonString) {
        try {
            objectMapper.readTree(jsonString);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
} 