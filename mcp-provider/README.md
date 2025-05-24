# MCP Provider Service

Bu proje, finansal işlem analizi yapan bir Spring Boot REST API servisidir.

## Özellikler

- `/action-analysis` endpoint'i ile POST istekleri kabul eder
- AI Provider servisi ile entegre çalışır
- Müşteri bilgilerini analiz eder ve dummy data sağlar
- 21 farklı finansal işlem türünü destekler
- Doğal dil işleme ile ilgili finansal aksiyonları belirler

## API Endpoint

### POST `/mcp-provider/action-analysis`

#### Request Body:
```json
{
  "content": "Ahmet, Veli'ye tasklarının durumunu sor",
  "specialPrompt": "Özel prompt (opsiyonel)",
  "model": "huggingface/deepseek/deepseek-v3-0324",
  "maxTokens": 1000,
  "temperature": 0.7,
  "customerNo": "12345"
}
```

#### Response:
```json
{
  "content": "AI provider'dan dönen içerik",
  "extraContent": "Orijinal prompt içeriği",
  "financeActionTypes": ["SEND_EMAIL", "LOG_CUSTOMER_INTERACTION"],
  "customer": {
    "customerNo": "12345",
    "accountId": "ACC-12345",
    "name": "Ahmet",
    "surname": "Yılmaz",
    "email": "ahmet.yilmaz@example.com"
  }
}
```

## Finansal İşlem Türleri

Proje aşağıdaki finansal işlem türlerini destekler:

1. **SEND_EMAIL** - Mail gönderimi
2. **GENERATE_STATEMENT** - Hesap ekstresi oluşturma
3. **SEND_PAYMENT_REMINDER** - Ödeme hatırlatması
4. **CREATE_INVOICE** - Fatura oluşturma
5. **PROCESS_PAYMENT** - Ödeme işleme
6. **REQUEST_LOAN_INFO** - Kredi bilgisi sorgulama
7. **UPDATE_CONTACT_INFO** - İletişim bilgisi güncelleme
8. **GENERATE_FINANCIAL_REPORT** - Finansal rapor hazırlama
9. **ALERT_FRAUD_DETECTION** - Dolandırıcılık tespiti
10. **SCHEDULE_MEETING** - Toplantı ayarlama
11. **TRANSFER_FUNDS** - Para transferi
12. **NOTIFY_POLICY_CHANGE** - Politika değişikliği bildirimi
13. **UPDATE_ACCOUNT_STATUS** - Hesap durumu güncelleme
14. **UPLOAD_DOCUMENT** - Belge yükleme
15. **CALCULATE_INTEREST** - Faiz hesaplama
16. **GENERATE_TAX_REPORT** - Vergi raporu
17. **BLOCK_CARD** - Kart bloke etme
18. **UNBLOCK_CARD** - Kart bloke açma
19. **GENERATE_BUDGET_PLAN** - Bütçe planı oluşturma
20. **SEND_MARKETING_CAMPAIGN** - Pazarlama kampanyası
21. **LOG_CUSTOMER_INTERACTION** - Müşteri etkileşimi kaydetme

## Çalıştırma

### Gereksinimler
- Java 17+
- Maven 3.6+
- AI Provider servisi (localhost:8082'de çalışıyor olmalı)

### Başlatma
```bash
cd mcp-provider
mvn spring-boot:run
```

Servis `http://localhost:8083/mcp-provider` adresinde çalışacaktır.

### Health Check
```
GET http://localhost:8083/mcp-provider/action-analysis/health
```

## Yapılandırma

`src/main/resources/application.properties` dosyasında aşağıdaki ayarları değiştirebilirsiniz:

- `server.port`: Servis portu (varsayılan: 8083)
- `ai.provider.base.url`: AI Provider servis URL'i (varsayılan: http://localhost:8082)

## Geliştirme Notları

- Customer servisi şu anda dummy data döndürür, gerçek servis entegrasyonu yapılacak
- AI Provider client'ı HTTP üzerinden çalışır
- Finansal işlem türü analizi basit keyword tabanlıdır, gelişmiş NLP ile iyileştirilebilir 