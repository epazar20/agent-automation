package com.example.agentprovider.client;

import com.example.agentprovider.model.TranscriptResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(
    name = "youtubeTranscriptor",
    url = "${rapidapi.youtube-transcriptor.url}",
    configuration = YoutubeTranscriptorConfig.class
)
public interface YoutubeTranscriptorClient {
    
    @PostMapping("/getTranscript")
    List<TranscriptResponse> getTranscript(@RequestBody String videoId);
} 