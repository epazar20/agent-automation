package com.example.mcpprovider.enums;

public enum FinanceActionType {

    SEND_EMAIL(
        "Mail gönderimlerini sağla",
        "Ahmet, Veli'ye tasklarının durumunu sor",
        "{\n  \"actions\": [\n    {\n      \"type\": \"send_email\",\n      \"senderName\": \"\",\n      \"recipientName\": \"\",\n      \"emailSubject\": \"\",\n      \"emailBodyTemplate\": \"\"\n    }\n  ]\n}"
    ),
    GENERATE_STATEMENT(
        "Hesap ekstresi, işlem dökümü, bakiye raporu oluştur ve müşteriye ilet.",
        "Hesap ekstresini gönder lütfen, Ahmet'ten Veli'ye ait hesap hareketlerini istiyorum.",
        "{\"senderName\":\"Ahmet\",\"recipientName\":\"Veli\",\"accountId\":\"123456\",\"customertId\":\"123456\",\"startDate\":\"2025-05-01\",\"endDate\":\"2025-05-15\",\"direction\":\"out\",\"minAmount\":500,\"maxAmount\":2000,\"transactionType\":\"purchase\",\"category\":\"shopping\",\"descriptionContains\":\"Trendyol\",\"limit\":10,\"order\":\"desc\",\"currency\":\"TRY\"}"
    ),
    SEND_PAYMENT_REMINDER(
        "Geciken ödemeler için hatırlatma maili veya SMS gönder.",
        "Veli'nin kredi kartı borcunu hatırlat.",
        "{\"recipientName\":\"Veli\",\"dueDate\":\"2025-06-01\",\"amount\":\"1500.00\"}"
    ),
    CREATE_INVOICE(
        "Belirli bir müşteri veya işlem için fatura oluştur ve maille ilet.",
        "Ahmet için son işlemlere ait fatura hazırla.",
        "{\"recipientName\":\"Ahmet\",\"invoiceId\":\"INV-20250525-001\"}"
    ),
    PROCESS_PAYMENT(
        "Müşteriden ödeme al, ödeme durumu güncelle.",
        "Ahmet'in kredi kartı ödemesini işle.",
        "{\"payerName\":\"Ahmet\",\"amount\":\"2000.00\",\"paymentMethod\":\"credit_card\"}"
    ),
    REQUEST_LOAN_INFO(
        "Müşteri için kredi başvuru durumu, kredi limiti bilgisi sorgula ve raporla.",
        "Veli'nin kredi başvurusu ne durumda?",
        "{\"customerName\":\"Veli\"}"
    ),
    UPDATE_CONTACT_INFO(
        "Müşterinin iletişim bilgilerini güncelle.",
        "Ahmet'in yeni e-posta adresini kaydet.",
        "{\"customerName\":\"Ahmet\",\"newEmail\":\"ahmet.yeni@example.com\",\"newPhone\":\"+905551112233\"}"
    ),
    GENERATE_FINANCIAL_REPORT(
        "Şirket, müşteri veya portföy bazında finansal rapor hazırla (kâr/zarar, gelir tablosu vb.)",
        "Mart ayı finansal raporunu hazırla.",
        "{\"companyId\":\"COMP-123\",\"reportPeriod\":\"2025-03\"}"
    ),
    ALERT_FRAUD_DETECTION(
        "Şüpheli işlem tespiti ve güvenlik uyarısı gönder.",
        "Veli'nin hesabında olağan dışı hareket var mı kontrol et.",
        "{\"accountId\":\"ACC-987654\",\"transactionId\":\"TX-20250523-01\"}"
    ),
    SCHEDULE_MEETING(
        "Finansal danışman ile müşteri arasında toplantı ayarla.",
        "Ahmet için finansal danışmanla randevu oluştur.",
        "{\"customerName\":\"Ahmet\",\"advisorName\":\"Deniz\",\"meetingDate\":\"2025-06-10T14:00:00\"}"
    ),
    TRANSFER_FUNDS(
        "Hesaplar arası para transferi yap.",
        "Veli'nin tasarruf hesabından cari hesabına 5000 TL aktar.",
        "{\"fromAccountId\":\"ACC-123\",\"toAccountId\":\"ACC-456\",\"amount\":\"5000.00\"}"
    ),
    NOTIFY_POLICY_CHANGE(
        "Hesap veya kredi politikalarında değişiklik bildirimi gönder.",
        "Kredi faiz oranlarındaki değişikliği müşterilere bildir.",
        "{\"policyId\":\"POL-2025-01\",\"changeDescription\":\"Faiz oranı %1.5'ten %1.3'e düştü.\"}"
    ),
    UPDATE_ACCOUNT_STATUS(
        "Hesap açma, kapama, askıya alma gibi durum güncellemeleri yap.",
        "Ahmet'in hesabını geçici olarak kapat.",
        "{\"accountId\":\"ACC-789\",\"newStatus\":\"suspended\"}"
    ),
    UPLOAD_DOCUMENT(
        "Müşteri tarafından gönderilen belgeleri sisteme yükle ve ilişkilendir.",
        "Veli'nin kimlik fotokopisini yükle.",
        "{\"customerName\":\"Veli\",\"documentType\":\"ID_CARD\",\"documentUrl\":\"https://example.com/docs/veli_id.pdf\"}"
    ),
    CALCULATE_INTEREST(
        "Belirli bir dönemin faiz hesaplamasını yap.",
        "Ahmet'in mevduat faizi ne kadar?",
        "{\"accountId\":\"ACC-123\",\"periodStart\":\"2025-01-01\",\"periodEnd\":\"2025-03-31\"}"
    ),
    GENERATE_TAX_REPORT(
        "Vergi raporu veya formu hazırla ve gönder.",
        "Veli'nin gelir vergisi beyanı için rapor hazırla.",
        "{\"customerName\":\"Veli\",\"taxYear\":\"2024\"}"
    ),
    BLOCK_CARD(
        "Kayıp veya çalıntı kart için kartı geçici olarak bloke et.",
        "Ahmet'in kredi kartını bloke et.",
        "{\"cardId\":\"CARD-5555\"}"
    ),
    UNBLOCK_CARD(
        "Daha önce bloke edilen kartı tekrar aktif hale getir.",
        "Veli'nin kartını tekrar aç.",
        "{\"cardId\":\"CARD-5555\"}"
    ),
    GENERATE_BUDGET_PLAN(
        "Müşteri için aylık veya yıllık bütçe planı hazırla.",
        "Ahmet için 2025 bütçe planı oluştur.",
        "{\"customerName\":\"Ahmet\",\"budgetYear\":\"2025\"}"
    ),
    SEND_MARKETING_CAMPAIGN(
        "Yeni ürün, kampanya veya fırsat bilgisi içeren toplu mail/sms gönder.",
        "Tüm müşterilere yeni kredi kampanyasını bildir.",
        "{\"campaignId\":\"CMP-202505\",\"targetGroup\":\"all_customers\"}"
    ),
    LOG_CUSTOMER_INTERACTION(
        "Müşteri ile yapılan görüşmeler veya işlemler kayıt altına al.",
        "Ahmet ile yapılan telefon görüşmesini kaydet.",
        "{\"customerName\":\"Ahmet\",\"interactionType\":\"phone_call\",\"notes\":\"Görüşme olumlu geçti.\"}"
    );

    private final String description;
    private final String samplePrompt;
    private final String jsonMap;

    FinanceActionType(String description, String samplePrompt, String jsonMap) {
        this.description = description;
        this.samplePrompt = samplePrompt;
        this.jsonMap = jsonMap;
    }

    public String getDescription() {
        return description;
    }

    public String getSamplePrompt() {
        return samplePrompt;
    }

    public String getJsonMap() {
        return jsonMap;
    }
} 