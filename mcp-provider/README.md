# MCP Provider Mikroservisi

Bu mikroservis, finansal işlemler ve müşteri yönetimi için RESTful API'ler sağlar.

## Özellikler

- **Müşteri Yönetimi**: Müşteri arama, oluşturma, güncelleme ve silme
- **Finansal İşlemler**: İşlem oluşturma, ekstre üretimi ve filtreleme
- **E-posta Sistemi**: Ek dosyalı e-posta gönderimi
- **Belge Yönetimi**: E-posta ekleri ve belge indirme
- **Finance Action Types**: Finansal aksiyon tiplerinin yönetimi
- **Özel Action Endpoint'leri**: Her finansal aksiyon için özel API endpoint'leri

## Teknolojiler

- **Java 17**
- **Spring Boot 3.2.x**
- **Spring Data JPA**
- **PostgreSQL** (Supabase ile)
- **Maven**
- **Lombok**
- **iText PDF** (PDF oluşturma için)
- **JavaMail** (E-posta gönderimi için)

## Konfigürasyon

### Veritabanı
```properties
spring.datasource.url=jdbc:postgresql://[SUPABASE_URL]/postgres
spring.datasource.username=[USERNAME]
spring.datasource.password=[PASSWORD]
```

### E-posta
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=[EMAIL]
spring.mail.password=[APP_PASSWORD]
```

## API Endpoint'leri

### Müşteri Yönetimi

#### Müşteri Arama
```http
POST /api/customers/search
Content-Type: application/json

{
    "searchText": "ahmet"
}
```

#### Tüm Müşterileri Listele
```http
GET /api/customers
```

#### Müşteri Detayı
```http
GET /api/customers/{id}
```

#### Müşteri Oluştur
```http
POST /api/customers
Content-Type: application/json

{
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "ahmet@example.com",
    "phone": "+905551234567",
    "status": "active"
}
```

### Finance Action Types Yönetimi

#### Tüm Action Type'ları Listele
```http
GET /api/finance-action-types
```

#### Aktif Action Type'ları Listele
```http
GET /api/finance-action-types/active
```

#### Action Type Detayı
```http
GET /api/finance-action-types/{id}
```

#### Code ile Action Type Sorgula
```http
GET /api/finance-action-types/code/{typeCode}
```

#### Endpoint Path ile Action Type Sorgula
```http
GET /api/finance-action-types/endpoint?endpointPath=/api/finance-actions/statement
```

#### Action Type Arama (İsim ile)
```http
GET /api/finance-action-types/search?name=ekstre
```

#### Action Type Oluştur
```http
POST /api/finance-action-types
Content-Type: application/json

{
    "typeCode": "CUSTOM_ACTION",
    "typeName": "ÖZEL AKSİYON",
    "description": "Özel finansal aksiyon açıklaması",
    "samplePrompt": "Özel aksiyon örnek prompt",
    "endpointPath": "/api/finance-actions/custom",
    "jsonSchema": "{\"param1\":\"value1\"}",
    "isActive": true,
    "sortOrder": 100
}
```

#### Action Type Güncelle
```http
PUT /api/finance-action-types/{id}
Content-Type: application/json

{
    "typeCode": "UPDATED_ACTION",
    "typeName": "GÜNCELLENMİŞ AKSİYON",
    "description": "Güncellenmiş açıklama",
    "samplePrompt": "Güncellenmiş prompt",
    "endpointPath": "/api/finance-actions/updated",
    "jsonSchema": "{\"param1\":\"updated_value\"}",
    "isActive": true,
    "sortOrder": 101
}
```

#### Action Type Aktif/Pasif Durumu Değiştir
```http
PATCH /api/finance-action-types/{id}/toggle-active
```

#### Action Type Sil
```http
DELETE /api/finance-action-types/{id}
```

## Özel Finance Action Endpoint'leri

Aşağıda her finansal aksiyon tipi için özel endpoint'ler bulunmaktadır:

### 1. EKSTRE ÜRETİMİ
```http
POST /api/finance-actions/statement
Content-Type: application/json

{
    "customerId": "1",
    "startDate": "2025-01-01T00:00:00",
    "endDate": "2025-06-01T23:59:59",
    "direction": "in",
    "currency": "TRY",
    "limit": 100,
    "order": "desc"
}
```

### 2. E-POSTA GÖNDERİMİ
```http
POST /api/finance-actions/email
Content-Type: application/json

{
    "to": "customer@example.com",
    "subject": "Finansal Bilgilendirme",
    "body": "E-posta içeriği",
    "attachmentIds": [1, 2, 3]
}
```

### 3. ÖDEME HATIRLATMASI
```http
POST /api/finance-actions/payment-reminder
Content-Type: application/json

{
    "recipientName": "Ahmet Yılmaz",
    "dueDate": "2025-06-01",
    "amount": "1500.00"
}
```

### 4. FATURA OLUŞTURMA
```http
POST /api/finance-actions/invoice
Content-Type: application/json

{
    "recipientName": "Veli Özkan",
    "invoiceId": "INV-20250525-001"
}
```

### 5. ÖDEME İŞLEMİ
```http
POST /api/finance-actions/payment
Content-Type: application/json

{
    "payerName": "Ahmet Yılmaz",
    "amount": "2000.00",
    "paymentMethod": "credit_card"
}
```

### 6. KREDİ BİLGİSİ SORGULAMA
```http
POST /api/finance-actions/loan-info
Content-Type: application/json

{
    "customerName": "Veli Özkan"
}
```

### 7. İLETİŞİM BİLGİSİ GÜNCELLEME
```http
POST /api/finance-actions/contact-info
Content-Type: application/json

{
    "customerName": "Ahmet Yılmaz",
    "newEmail": "ahmet.yeni@example.com",
    "newPhone": "+905551112233"
}
```

### 8. FİNANSAL RAPOR OLUŞTURMA
```http
POST /api/finance-actions/financial-report
Content-Type: application/json

{
    "companyId": "COMP-123",
    "reportPeriod": "2025-03"
}
```

### 9. SAHTECİLİK TESPİTİ UYARISI
```http
POST /api/finance-actions/fraud-alert
Content-Type: application/json

{
    "accountId": "ACC-987654",
    "transactionId": "TX-20250523-01"
}
```

### 10. RANDEVU PLANLAMA
```http
POST /api/finance-actions/meeting
Content-Type: application/json

{
    "customerName": "Ahmet Yılmaz",
    "advisorName": "Deniz Kaya",
    "meetingDate": "2025-06-10T14:00:00"
}
```

### 11. PARA TRANSFERİ
```http
POST /api/finance-actions/transfer
Content-Type: application/json

{
    "fromAccountId": "ACC-123",
    "toAccountId": "ACC-456",
    "amount": "5000.00"
}
```

### 12. POLİTİKA DEĞİŞİKLİĞİ BİLDİRİMİ
```http
POST /api/finance-actions/policy-change
Content-Type: application/json

{
    "policyId": "POL-2025-01",
    "changeDescription": "Faiz oranı %1.5'ten %1.3'e düştü."
}
```

### 13. HESAP DURUMU GÜNCELLEME
```http
POST /api/finance-actions/account-status
Content-Type: application/json

{
    "accountId": "ACC-789",
    "newStatus": "suspended"
}
```

### 14. BELGE YÜKLEME
```http
POST /api/finance-actions/document
Content-Type: application/json

{
    "customerName": "Veli Özkan",
    "documentType": "ID_CARD",
    "documentUrl": "https://example.com/docs/veli_id.pdf"
}
```

### 15. FAİZ HESAPLAMA
```http
POST /api/finance-actions/interest
Content-Type: application/json

{
    "accountId": "ACC-123",
    "periodStart": "2025-01-01",
    "periodEnd": "2025-03-31"
}
```

### 16. VERGİ RAPORU OLUŞTURMA
```http
POST /api/finance-actions/tax-report
Content-Type: application/json

{
    "customerName": "Veli Özkan",
    "taxYear": "2024"
}
```

### 17. KART ENGELLEME
```http
POST /api/finance-actions/block-card
Content-Type: application/json

{
    "cardId": "CARD-5555"
}
```

### 18. KART ENGEL KALDIRMA
```http
POST /api/finance-actions/unblock-card
Content-Type: application/json

{
    "cardId": "CARD-5555"
}
```

### 19. BÜTÇE PLANI OLUŞTURMA
```http
POST /api/finance-actions/budget-plan
Content-Type: application/json

{
    "customerName": "Ahmet Yılmaz",
    "budgetYear": "2025"
}
```

### 20. PAZARLAMA KAMPANYASI GÖNDERİMİ
```http
POST /api/finance-actions/marketing-campaign
Content-Type: application/json

{
    "campaignId": "CMP-202505",
    "targetGroup": "all_customers"
}
```

### 21. MÜŞTERİ ETKİLEŞİMİ KAYDETME
```http
POST /api/finance-actions/customer-interaction
Content-Type: application/json

{
    "customerName": "Ahmet Yılmaz",
    "interactionType": "phone_call",
    "notes": "Görüşme olumlu geçti."
}
```

## E-posta Eki Yönetimi

### Tüm Ekleri Listele
```http
GET /api/email-attachments
```

### Ek Detayı (İçerik Dahil)
```http
GET /api/email-attachments/{id}/with-content
```

### Ek İndir
```http
GET /api/email-attachments/{id}/download
```

### Action Type'a Göre Ekler
```http
GET /api/email-attachments/action-type/GENERATE_STATEMENT
```

### Müşteriye Göre Ekler
```http
GET /api/email-attachments/customer/{customerId}
```

## Finansal İşlemler

### İşlem Ekstresi
```http
GET /api/transactions/statement?customerId=1&startDate=2025-01-01T00:00:00&endDate=2025-06-01T23:59:59
```

### Yeni İşlem Oluştur
```http
POST /api/transactions
Content-Type: application/json

{
    "customer": {"id": 1},
    "transactionType": "purchase",
    "category": "shopping",
    "direction": "out",
    "amount": 250.50,
    "currency": "TRY",
    "description": "Market alışverişi",
    "counterpartyName": "ABC Market"
}
```

## Hesap Yönetimi

### Müşteri Hesapları
```http
GET /api/accounts/customer/{customerId}
```

### Hesap Bakiyesi
```http
GET /api/accounts/{id}/balance
```

### Hesap İşlemleri
```http
GET /api/accounts/{id}/transactions
```

## Kredi Kartı Yönetimi

### Borç Listesi
```http
GET /api/credit-cards/debts
```

### Vadesi Geçen Borçlar
```http
GET /api/credit-cards/debts/overdue
```

### Müşteri Borçları
```http
GET /api/credit-cards/debts/customer?firstName=Ahmet&lastName=Yılmaz
```

## E-posta Gönderimi

### Basit E-posta
```http
POST /api/emails/simple
Content-Type: application/json

{
    "to": "customer@example.com",
    "subject": "Bilgilendirme",
    "body": "E-posta içeriği"
}
```

### HTML E-posta
```http
POST /api/emails/html
Content-Type: application/json

{
    "to": "customer@example.com",
    "subject": "HTML Bilgilendirme",
    "body": "<h1>Başlık</h1><p>İçerik</p>"
}
```

### Hoş Geldin E-postası
```http
POST /api/emails/welcome?to=customer@example.com&customerName=Ahmet&accountNumber=1234567890
```

## Aksiyon Analizi

### AI Destekli Aksiyon Analizi
```http
POST /action-analysis
Content-Type: application/json

{
    "content": "Ahmet'in hesap ekstresini gönder",
    "customerNo": "1"
}
```

## Durum Kodları

- **200 OK**: Başarılı işlem
- **201 Created**: Kaynak başarıyla oluşturuldu
- **400 Bad Request**: Geçersiz istek
- **404 Not Found**: Kaynak bulunamadı
- **409 Conflict**: Çakışma (örn: e-posta zaten mevcut)
- **500 Internal Server Error**: Sunucu hatası

## Hata Formatı

```json
{
    "timestamp": "2025-06-17T14:30:00",
    "status": 400,
    "error": "Bad Request",
    "message": "Validation failed",
    "path": "/api/customers"
}
```

## Geliştirme

### Projeyi Çalıştırma
```bash
mvn spring-boot:run
```

### Test Etme
```bash
mvn test
```

### Docker ile Çalıştırma
```bash
docker build -t mcp-provider .
docker run -p 8083:8083 mcp-provider
```

## Önemli Notlar

1. **Finance Action Types** sistemi uygulama başlatılırken otomatik olarak initialize edilir
2. Tüm API endpoint'leri CORS destekli olarak yapılandırılmıştır
3. E-posta ekleri base64 formatında saklanır
4. PDF dosyaları otomatik olarak oluşturulur ve veritabanında saklanır
5. Tüm finansal işlemler loglanır ve izlenebilir
6. Action Type'lar veritabanında dinamik olarak yönetilebilir

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 