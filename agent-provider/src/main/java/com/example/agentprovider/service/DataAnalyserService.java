package com.example.agentprovider.service;

import org.springframework.web.multipart.MultipartFile;
import com.example.agentprovider.model.DataAnalyserRequest;
import com.example.agentprovider.model.DataAnalyserResponse;

public interface DataAnalyserService {
    DataAnalyserResponse analyseData(MultipartFile file, DataAnalyserRequest request);
} 