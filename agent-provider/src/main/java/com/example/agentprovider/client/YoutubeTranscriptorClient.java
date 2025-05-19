package com.example.agentprovider.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.example.agentprovider.config.YoutubeTranscriptorClientConfig;
import com.example.agentprovider.model.youtubeTranscript.TranscriptResponse;
import java.util.List;

@FeignClient(
    name = "youtubeTranscriptorClient",
    url = "${rapidapi.youtube.url}",
    configuration = YoutubeTranscriptorClientConfig.class
)
public interface YoutubeTranscriptorClient {
    @GetMapping("/transcript")
    List<TranscriptResponse> getTranscript(@RequestParam("video_id") String videoId);
} 