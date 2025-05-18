package com.example.agentprovider.client;

import com.example.agentprovider.model.deepl.DeepLRequest;
import com.example.agentprovider.model.deepl.DeepLResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
    name = "deepL",
    url = "${deepl.api.url}",
    configuration = DeepLClientConfig.class
)
public interface DeepLClient {
    
    @PostMapping("/v2/translate")
    DeepLResponse translate(
        @RequestHeader("Authorization") String authKey,
        @RequestBody DeepLRequest request
    );
} 