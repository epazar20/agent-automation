package com.example.agentprovider.model;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
public class YoutubeSummarizeRequest extends AiRequest {

    @NotBlank(message = "YouTube URL is required")
    private String url; // YouTube URL

}