package com.example.mcpprovider;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class McpProviderApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(McpProviderApplication.class);
        
        // IDE'de direkt run yapınca dev profile kullan
        String activeProfile = System.getProperty("spring.profiles.active");
        if (activeProfile == null || activeProfile.isEmpty()) {
            app.setAdditionalProfiles("dev");
            System.out.println("🔧 No profile specified, using 'dev' profile for IDE development");
        }
        
        // Environment variables kontrolü ve bilgilendirme
        String dbPassword = System.getenv("SPRING_DATASOURCE_PASSWORD");
        if (dbPassword == null || dbPassword.isEmpty()) {
            System.out.println("⚠️  SPRING_DATASOURCE_PASSWORD environment variable not set!");
            System.out.println("💡 Using hardcoded values from application-dev.properties (IDE mode)");
            System.out.println("💡 For production: Use environment variables");
        } else {
            System.out.println("✅ Database password loaded from environment variable");
        }
        
        app.run(args);
    }
} 