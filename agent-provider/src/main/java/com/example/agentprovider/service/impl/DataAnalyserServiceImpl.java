package com.example.agentprovider.service.impl;

import com.example.agentprovider.client.AiProviderClient;
import com.example.agentprovider.model.AiRequest;
import com.example.agentprovider.model.AiResponse;
import com.example.agentprovider.model.DataAnalyserRequest;
import com.example.agentprovider.model.DataAnalyserResponse;
import com.example.agentprovider.service.DataAnalyserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.xy.XYSeries;
import org.jfree.data.xy.XYSeriesCollection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class DataAnalyserServiceImpl implements DataAnalyserService {

    private static final Logger logger = LoggerFactory.getLogger(DataAnalyserServiceImpl.class);
    private final AiProviderClient aiProviderClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public DataAnalyserServiceImpl(AiProviderClient aiProviderClient, ObjectMapper objectMapper) {
        this.aiProviderClient = aiProviderClient;
        this.objectMapper = objectMapper;
    }

    private String convertExcelToJson(InputStream inputStream, String contentType) throws IOException {
        Workbook workbook;
        if (contentType.contains("xlsx")) {
            workbook = new XSSFWorkbook(inputStream);
        } else {
            workbook = new HSSFWorkbook(inputStream);
        }

        Sheet sheet = workbook.getSheetAt(0);
        Row headerRow = sheet.getRow(0);
        
        if (headerRow == null) {
            workbook.close();
            return "[]";
        }

        // Get headers
        List<String> headers = new ArrayList<>();
        for (Cell cell : headerRow) {
            headers.add(cell.toString().trim());
        }

        // Create JSON array
        ArrayNode jsonArray = objectMapper.createArrayNode();

        // Iterate through data rows
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            ObjectNode jsonObject = objectMapper.createObjectNode();
            
            for (int j = 0; j < headers.size(); j++) {
                Cell cell = row.getCell(j);
                if (cell == null) continue;

                String header = headers.get(j);
                switch (cell.getCellType()) {
                    case NUMERIC:
                        if (DateUtil.isCellDateFormatted(cell)) {
                            jsonObject.put(header, cell.getDateCellValue().toString());
                        } else {
                            jsonObject.put(header, cell.getNumericCellValue());
                        }
                        break;
                    case BOOLEAN:
                        jsonObject.put(header, cell.getBooleanCellValue());
                        break;
                    case STRING:
                    default:
                        jsonObject.put(header, cell.toString().trim());
                        break;
                }
            }
            jsonArray.add(jsonObject);
        }

        workbook.close();
        return objectMapper.writeValueAsString(jsonArray);
    }

    private String convertCsvToJson(InputStream inputStream) throws IOException {
        ArrayNode jsonArray = objectMapper.createArrayNode();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.Builder.create().setHeader().build())) {
            
            // Get headers
            Map<String, Integer> headerMap = csvParser.getHeaderMap();
            
            // Process records
            for (CSVRecord record : csvParser) {
                ObjectNode jsonObject = objectMapper.createObjectNode();
                
                for (Map.Entry<String, Integer> header : headerMap.entrySet()) {
                    String value = record.get(header.getValue()).trim();
                    String key = header.getKey().trim();
                    
                    // Try to parse as number if possible
                    try {
                        if (value.contains(".")) {
                            jsonObject.put(key, Double.parseDouble(value));
                        } else {
                            jsonObject.put(key, Integer.parseInt(value));
                        }
                    } catch (NumberFormatException e) {
                        jsonObject.put(key, value);
                    }
                }
                jsonArray.add(jsonObject);
            }
        }
        
        return objectMapper.writeValueAsString(jsonArray);
    }

    private String generateChart(String jsonData, String xAxis, String yAxis) {
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonData);
            
            // Check if data is an array
            if (!jsonNode.isArray()) {
                logger.error("JSON data is not an array");
                return null;
            }

            // Create dataset based on data type
            boolean isNumericX = false;
            boolean isNumericY = false;
            
            // Check first element to determine data types
            if (jsonNode.size() > 0) {
                JsonNode firstElement = jsonNode.get(0);
                JsonNode xValue = firstElement.get(xAxis);
                JsonNode yValue = firstElement.get(yAxis);
                
                isNumericX = xValue.isNumber();
                isNumericY = yValue.isNumber();
            }

            JFreeChart chart;
            
            if (isNumericX && isNumericY) {
                // Create XY chart for numeric data
                XYSeriesCollection dataset = new XYSeriesCollection();
                XYSeries series = new XYSeries("Data");
                
                for (JsonNode element : jsonNode) {
                    double x = element.get(xAxis).asDouble();
                    double y = element.get(yAxis).asDouble();
                    series.add(x, y);
                }
                dataset.addSeries(series);
                
                chart = ChartFactory.createXYLineChart(
                    String.format("%s vs %s", xAxis, yAxis),
                    xAxis,
                    yAxis,
                    dataset,
                    PlotOrientation.VERTICAL,
                    true,
                    true,
                    false
                );
            } else {
                // Create category chart for non-numeric data
                DefaultCategoryDataset dataset = new DefaultCategoryDataset();
                
                for (JsonNode element : jsonNode) {
                    String x = element.get(xAxis).asText();
                    double y = isNumericY ? element.get(yAxis).asDouble() : 
                             Double.parseDouble(element.get(yAxis).asText());
                    dataset.addValue(y, "Data", x);
                }
                
                chart = ChartFactory.createBarChart(
                    String.format("%s vs %s", xAxis, yAxis),
                    xAxis,
                    yAxis,
                    dataset,
                    PlotOrientation.VERTICAL,
                    true,
                    true,
                    false
                );
            }

            // Convert chart to base64 image
            BufferedImage image = chart.createBufferedImage(800, 600);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(image, "png", outputStream);
            return Base64.getEncoder().encodeToString(outputStream.toByteArray());

        } catch (Exception e) {
            logger.error("Error generating chart: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public DataAnalyserResponse analyseData(MultipartFile file, DataAnalyserRequest request) {
        long startTime = System.currentTimeMillis();
        String jsonData;

        try {
            // Check if file exists and process it
            if (file != null && !file.isEmpty()) {
                String contentType = file.getContentType();
                if (contentType == null || (!contentType.contains("excel") && 
                    !contentType.contains("csv") && !contentType.contains("json"))) {
                    return DataAnalyserResponse.builder()
                            .success(false)
                            .errorMessage("Unsupported file type. Only Excel, CSV, or JSON files are supported.")
                            .processingTimeMs(System.currentTimeMillis() - startTime)
                            .build();
                }

                // Convert file to JSON based on type
                if (contentType.contains("csv")) {
                    jsonData = convertCsvToJson(file.getInputStream());
                } else if (contentType.contains("excel")) {
                    jsonData = convertExcelToJson(file.getInputStream(), contentType);
                } else {
                    // For JSON files, read directly
                    jsonData = new BufferedReader(new InputStreamReader(file.getInputStream()))
                            .lines().collect(Collectors.joining("\n"));
                }

                if (jsonData == null) {
                    return DataAnalyserResponse.builder()
                            .success(false)
                            .errorMessage("Failed to convert file to JSON format.")
                            .processingTimeMs(System.currentTimeMillis() - startTime)
                            .build();
                }
            } else {
                // Try to find JSON data in content
                String content = request.getContent();
                if (content == null || content.isEmpty()) {
                    return DataAnalyserResponse.builder()
                            .success(false)
                            .errorMessage("No data provided in either file or content.")
                            .processingTimeMs(System.currentTimeMillis() - startTime)
                            .build();
                }

                // Pattern to match JSON array or object
                Pattern jsonPattern = Pattern.compile("\\[.*\\]|\\{.*\\}");
                Matcher matcher = jsonPattern.matcher(content);
                if (!matcher.find()) {
                    return DataAnalyserResponse.builder()
                            .success(false)
                            .errorMessage("No JSON data found in content.")
                            .processingTimeMs(System.currentTimeMillis() - startTime)
                            .build();
                }

                jsonData = matcher.group();
                // Remove JSON data from content
                request.setContent(content.replace(jsonData, ""));
            }

            // Validate JSON data
            objectMapper.readTree(jsonData);

            // Create prompt by combining JSON data and content
            String prompt = String.format("%s Bu verileri analiz ederek: %s", jsonData, request.getContent() != null ? request.getContent() : "");
            request.setContent(prompt);

            // Call AI service
            AiResponse aiResponse = aiProviderClient.generateContent(request);

            // Build response
            DataAnalyserResponse.DataAnalyserResponseBuilder<?, ?> responseBuilder = DataAnalyserResponse.builder()
                    .content(aiResponse.getContent())
                    .model(aiResponse.getModel())
                    .success(aiResponse.isSuccess())
                    .processingTimeMs(System.currentTimeMillis() - startTime);

            // Set error message if any
            if (!aiResponse.isSuccess()) {
                responseBuilder.errorMessage(aiResponse.getErrorMessage());
            }

            // Generate graph if axis parameters are valid
            if (request.getXAxis() != null && request.getYAxis() != null &&
                jsonData.contains(request.getXAxis()) && jsonData.contains(request.getYAxis())) {
                String base64Image = generateChart(jsonData, request.getXAxis(), request.getYAxis());
                responseBuilder.base64Image(base64Image);
            }

            return responseBuilder.build();

        } catch (Exception e) {
            logger.error("Error analyzing data: {}", e.getMessage(), e);
            return DataAnalyserResponse.builder()
                    .success(false)
                    .errorMessage("Error processing request: " + e.getMessage())
                    .processingTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }
    }
} 