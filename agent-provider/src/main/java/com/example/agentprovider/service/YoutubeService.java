package com.example.agentprovider.service;

import com.example.agentprovider.model.YoutubeSummarizeRequest;
import com.example.agentprovider.model.YoutubeSummarizeResponse;

public interface YoutubeService {
    /**
     * Summarizes a YouTube video using its URL
     * @param request The summarization request containing YouTube URL and other parameters
     * @return The summarization response
     */
    YoutubeSummarizeResponse summarizeVideo(YoutubeSummarizeRequest request);
    
    /**
     * Extracts the video ID from a YouTube URL
     * @param url The YouTube URL
     * @return The extracted video ID
     */
    String extractYoutubeVideoId(String url);
} 