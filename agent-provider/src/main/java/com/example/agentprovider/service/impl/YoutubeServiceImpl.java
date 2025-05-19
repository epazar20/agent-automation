package com.example.agentprovider.service.impl;

import com.example.agentprovider.client.AiProviderClient;
import com.example.agentprovider.client.YoutubeTranscriptorClient;
import com.example.agentprovider.model.AiRequest;
import com.example.agentprovider.model.AiResponse;
import com.example.agentprovider.model.youtubeTranscript.TranscriptResponse;
import com.example.agentprovider.model.YoutubeSummarizeRequest;
import com.example.agentprovider.model.YoutubeSummarizeResponse;
import com.example.agentprovider.service.YoutubeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class YoutubeServiceImpl implements YoutubeService {

    private static final Logger logger = LoggerFactory.getLogger(YoutubeServiceImpl.class);

    private final YoutubeTranscriptorClient youtubeTranscriptorClient;
    private final AiProviderClient aiProviderClient;

    @Autowired
    public YoutubeServiceImpl(YoutubeTranscriptorClient youtubeTranscriptorClient,
            AiProviderClient aiProviderClient) {
        this.youtubeTranscriptorClient = youtubeTranscriptorClient;
        this.aiProviderClient = aiProviderClient;
    }

    @Override
    public YoutubeSummarizeResponse summarizeVideo(YoutubeSummarizeRequest request) {
        long startTime = System.currentTimeMillis();

        // Check if URL is provided directly
        String youtubeUrl = request.getUrl();

        // If URL is not provided, try to find it in content
        if (youtubeUrl == null || youtubeUrl.isEmpty()) {
            String content = request.getContent();
            if (content != null && !content.isEmpty()) {
                // Pattern to match YouTube URLs in content
                Pattern youtubePattern = Pattern.compile(
                        "https?://(?:www\\.)?youtube\\.com/watch\\?v=[\\w-]+|" +
                                "https?://(?:www\\.)?youtu\\.be/[\\w-]+");
                Matcher matcher = youtubePattern.matcher(content);
                if (matcher.find()) {
                    youtubeUrl = matcher.group(0);
                    logger.info("Found YouTube URL in content: {}", youtubeUrl);

                }
            }
        }

        // If no YouTube URL found, return error
        if (youtubeUrl == null || youtubeUrl.isEmpty()) {
            logger.warn("No YouTube URL provided or found in content");
            return YoutubeSummarizeResponse.builder()
                    .success(false)
                    .errorMessage("No YouTube URL provided or found in content")
                    .processingTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }

        // Extract the video ID from the YouTube URL
        String videoId = extractYoutubeVideoId(youtubeUrl);
        logger.info("Extracted video ID: {}", videoId);

        if (videoId.isEmpty()) {
            return YoutubeSummarizeResponse.builder()
                    .success(false)
                    .errorMessage("Invalid YouTube URL format")
                    .processingTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }

        try {
            // Step 1: Get the transcript from RapidAPI
            logger.info("Fetching transcript for video ID: {}", videoId);
            List<TranscriptResponse> transcriptResponses = youtubeTranscriptorClient.getTranscript(videoId);

            if (transcriptResponses == null || transcriptResponses.isEmpty() ||
                    transcriptResponses.get(0).getTranscriptionAsText() == null ||
                    transcriptResponses.get(0).getTranscriptionAsText().isEmpty()) {
                logger.warn("No transcript found for video ID: {}", videoId);
                return YoutubeSummarizeResponse.builder()
                        .videoId(videoId)
                        .success(false)
                        .errorMessage("Could not retrieve transcript for the video")
                        .processingTimeMs(System.currentTimeMillis() - startTime)
                        .build();
            }

            TranscriptResponse transcriptResponse = transcriptResponses.get(0);
            logger.debug("Received transcript: {}", transcriptResponse.getTranscriptionAsText());

            // Step 2: Send the transcript to AI service for summarization
            logger.info("Sending transcript to AI service for summarization");
            AiRequest aiRequest = AiRequest.builder()
                    .content(transcriptResponse.getTranscriptionAsText())
                    .specialPrompt(request.getSpecialPrompt())
                    .model(request.getModel())
                    .maxTokens(request.getMaxTokens())
                    .temperature(request.getTemperature())
                    .build();

            AiResponse aiResponse = aiProviderClient.generateContent(aiRequest);

            // Step 3: Build and return the final response
            YoutubeSummarizeResponse response = YoutubeSummarizeResponse.builder()
                    .videoId(videoId)
                    .content(aiResponse.getContent())
                    .model(aiResponse.getModel())
                    .processingTimeMs(System.currentTimeMillis() - startTime)
                    .success(aiResponse.isSuccess())
                    .build();

            if (!aiResponse.isSuccess()) {
                response.setErrorMessage(aiResponse.getErrorMessage());
            }

            return response;

        } catch (Exception e) {
            logger.error("Error summarizing YouTube video: {}", e.getMessage(), e);
            return YoutubeSummarizeResponse.builder()
                    .videoId(videoId)
                    .success(false)
                    .errorMessage("Error processing request: " + e.getMessage())
                    .processingTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }
    }

    @Override
    public String extractYoutubeVideoId(String url) {
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