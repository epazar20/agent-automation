# MCP Provider Service

MCP Provider Service, finansal işlemler için kapsamlı bir REST API sağlayan Spring Boot mikroservisidir. Supabase PostgreSQL veritabanı ile entegre çalışır ve müşteri hesap yönetimi, kredi kartı işlemleri, finansal raporlama gibi temel bankacılık operasyonlarını destekler.

## Özellikler

### Temel Modüller
- **Müşteri Yönetimi**: Müşteri CRUD işlemleri, arama ve filtreleme
- **Hesap Yönetimi**: Banka hesapları, bakiye takibi, hesap hareketleri
- **Kredi Kartı Yönetimi**: Kredi kartı borçları, ödeme takibi, gecikme hesaplamaları
- **İşlem Takibi**: Finansal işlemler, hesap hareketleri, transfer işlemleri
- **Raporlama**: Finansal raporlar, vergi beyanları, bütçe planları

### Desteklenen Senaryolar
- ✅ Müşteri hesap ilişkileri ve hareketleri
- ✅ Hesap giriş/çıkış işlemleri takibi
- ✅ Kredi kartı borç ve gecikme hesaplamaları
- ✅ Fatura oluşturma ve takibi
- ✅ Kredi başvuru ve taksit yönetimi
- ✅ Finansal raporlama ve analiz
- ✅ Şüpheli işlem tespiti
- ✅ Danışman randevu sistemi
- ✅ Para transferi işlemleri
- ✅ Hesap durum yönetimi
- ✅ Doküman yönetimi
- ✅ Faiz hesaplamaları
- ✅ Vergi raporları
- ✅ Kart bloke/açma işlemleri
- ✅ Bütçe planlama
- ✅ Kampanya yönetimi

## Teknoloji Stack

- **Framework**: Spring Boot 3.2.5
- **Java Version**: 17
- **Database**: PostgreSQL (Supabase)
- **ORM**: Hibernate/JPA
- **Connection Pool**: HikariCP
- **Build Tool**: Maven
- **Documentation**: OpenAPI/Swagger

## Veritabanı Yapısı

### Ana Tablolar
- `customers` - Müşteri bilgileri
- `accounts` - Hesap bilgileri
- `cards` - Kart bilgileri
- `financial_transactions` - Finansal işlemler
- `account_transactions` - Hesap hareketleri
- `credit_card_debts` - Kredi kartı borçları
- `loan_applications` - Kredi başvuruları
- `loan_installments` - Kredi taksitleri
- `financial_advisors` - Finansal danışmanlar
- `advisor_appointments` - Danışman randevuları
- `budget_plans` - Bütçe planları
- `tax_declarations` - Vergi beyanları
- `suspicious_activities` - Şüpheli işlemler
- `documents` - Dokümanlar
- `notifications` - Bildirimler

### İlişkisel Tablolar
- `account_relationships` - Hesap ilişkileri
- `account_status_history` - Hesap durum geçmişi
- `card_block_history` - Kart bloke geçmişi
- `interest_rate_history` - Faiz oranı geçmişi
- `campaigns` - Kampanyalar

## Kurulum

### Gereksinimler
- Java 17+
- Maven 3.6+
- PostgreSQL (Supabase)

### Ortam Değişkenleri
```bash
DB_PASSWORD=your_database_password
DATABASE_URL=postgresql://postgres.srtihtbzckhristzucid:${DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Çalıştırma
```bash
# Bağımlılıkları yükle
mvn clean install

# Uygulamayı başlat
mvn spring-boot:run

# Veya JAR olarak çalıştır
java -jar target/mcp-provider-0.0.1-SNAPSHOT.jar
```

## API Endpoints

### Müşteri İşlemleri
```
GET    /api/customers                    # Tüm müşterileri listele
GET    /api/customers/{id}               # ID ile müşteri getir
GET    /api/customers/email/{email}      # Email ile müşteri getir
GET    /api/customers/name               # İsim ile müşteri getir
GET    /api/customers/search             # İsim ile arama
POST   /api/customers                    # Yeni müşteri oluştur
PUT    /api/customers/{id}               # Müşteri güncelle
DELETE /api/customers/{id}               # Müşteri sil
```

### Hesap İşlemleri
```
GET    /api/accounts                     # Tüm hesapları listele
GET    /api/accounts/{id}                # ID ile hesap getir
GET    /api/accounts/customer/{id}       # Müşteri hesaplarını getir
GET    /api/accounts/customer/name       # İsim ile müşteri hesapları
GET    /api/accounts/{id}/transactions   # Hesap hareketleri
GET    /api/accounts/{id}/balance        # Hesap bakiyesi
POST   /api/accounts                     # Yeni hesap oluştur
POST   /api/accounts/{id}/transactions   # Yeni işlem oluştur
```

### Kredi Kartı İşlemleri
```
GET    /api/credit-cards/debts           # Tüm borçları listele
GET    /api/credit-cards/debts/customer  # Müşteri borçları
GET    /api/credit-cards/debts/overdue   # Geciken borçlar
POST   /api/credit-cards/debts/{id}/pay  # Borç ödeme
```

## Örnek Kullanım

### Müşteri Hesap Hareketlerini Getirme
```bash
# Ahmet adlı müşterinin hesap hareketleri
GET /api/accounts/transactions/customer?firstName=Ahmet&lastName=Yılmaz
```

### Kredi Kartı Borç Sorgulama
```bash
# Veli'nin kredi kartı borçları ve gecikme bilgileri
GET /api/credit-cards/debts/customer?firstName=Veli&lastName=Kaya
```

### Hesap Bakiye Sorgulama
```bash
# Hesap bakiyesi
GET /api/accounts/123/balance
```

## Güvenlik

- Veritabanı şifresi environment variable olarak saklanır
- `.env` dosyası `.gitignore`'a eklenmiştir
- Connection pooling ile güvenli bağlantı yönetimi
- Input validation ve error handling

## Monitoring

- Spring Boot Actuator endpoints
- Health check: `/actuator/health`
- Metrics: `/actuator/metrics`
- Detailed logging configuration

## Geliştirme

### Yeni Entity Ekleme
1. `entity` paketinde yeni entity sınıfı oluştur
2. `repository` paketinde repository interface'i oluştur
3. `service` paketinde business logic ekle
4. `controller` paketinde REST endpoints tanımla

### Veritabanı Migration
Supabase MCP kullanarak yeni tablolar ve veriler eklenebilir.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 