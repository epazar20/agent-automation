# 🚀 MCP Provider - Simplified Development

> **Basitleştirilmiş, konfigürasyon karışıklığı olmayan Spring Boot projesi**

## ⚡ Quick Start

### 🔥 IDE (Zero Config)
```
1. McpProviderApplication.java → Run
2. Done! ✅ (Port: 8083)
```

### 🖥️ Terminal
```bash
./run-dev-secure.sh
```

## 📁 Structure

```
mcp-provider/
├── src/main/resources/
│   ├── application.properties          # Production (env vars)
│   ├── application-dev.properties      # Development (hardcoded, .gitignore)
│   └── application-secrets.properties  # Backup secrets (.gitignore)
├── McpProviderApplication.java         # Auto dev profile
└── run-dev-secure.sh                   # Single dev script
```

## 🔧 Configuration

| Environment | Profile | Properties File | Password Source | Git Status |
|-------------|---------|----------------|-----------------|------------|
| **IDE** | `dev` | application-dev.properties | Hardcoded | 🚫 .gitignore |
| **Script** | `dev` | application-dev.properties | Hardcoded | 🚫 .gitignore |
| **Production** | `default` | application.properties | Environment Variables | ✅ Git tracked |

## 🔐 Security

### ✅ **Git Güvenliği:**
- **application-dev.properties**: `.gitignore`'da - Git'e gitmez
- **application-secrets.properties**: `.gitignore`'da - Git'e gitmez
- **application.properties**: Git'e gider ama sadece placeholder'lar var

### 🛡️ **Password Yönetimi:**
- **Development**: Hardcoded (local only, Git'e gitmiyor)
- **Production**: Environment variables (Fly.io)

## 🧪 Test API

```bash
# Health check
curl http://localhost:8083/mcp-provider/actuator/health

# Data endpoints
curl http://localhost:8083/mcp-provider/api/customers
curl http://localhost:8083/mcp-provider/api/finance-action-types
```

## ✅ Benefits

- ✅ **Zero Configuration**: IDE'de direkt çalışır
- ✅ **Git Safe**: Hardcoded değerler Git'e gitmez
- ✅ **Clean Structure**: 2 properties dosyası  
- ✅ **Debug Ready**: SQL logs + Debug aktif
- ✅ **Production Safe**: Environment variables
- ✅ **Single Script**: Tek development script

## 🎯 Development Tips

- **Hot Reload**: Spring DevTools aktif
- **SQL Logging**: Development'ta görünür
- **Debug Mode**: Detaylı loglar
- **Auto Profile**: IDE otomatik dev profile
- **Güvenlik**: Sensitive dosyalar .gitignore'da

## 📝 Setup Notes

1. **İlk çalıştırma**: `application-dev.properties` otomatik oluşturulur
2. **Git push**: Sensitive dosyalar ignore edilir
3. **Production**: Environment variables kullanılır
4. **Team work**: Herkes kendi dev properties'ini oluşturur

---
**🎉 Maksimum basitlik, maksimum güvenlik!** 