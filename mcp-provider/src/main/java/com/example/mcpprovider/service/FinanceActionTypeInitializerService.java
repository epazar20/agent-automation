package com.example.mcpprovider.service;

import com.example.mcpprovider.entity.FinanceActionType;
import com.example.mcpprovider.repository.FinanceActionTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service  // Re-enabled for proper initialization
@RequiredArgsConstructor
@Slf4j
public class FinanceActionTypeInitializerService implements ApplicationRunner {
    
    private final FinanceActionTypeRepository financeActionTypeRepository;
    
    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (financeActionTypeRepository.count() == 0) {
            log.info("Initializing Finance Action Types...");
            initializeFinanceActionTypes();
            log.info("Finance Action Types initialized successfully");
        } else {
            log.info("Finance Action Types already exist, skipping initialization");
        }
    }
    
    private void initializeFinanceActionTypes() {
        List<FinanceActionType> actionTypes = new ArrayList<>();
        
        actionTypes.add(createActionType(
            "SEND_EMAIL",
            "E-POSTA GÖNDERİMİ", 
            "Mail gönderimlerini sağla",
            "Ahmet, Veli'ye tasklarının durumunu sor",
            "/api/finance-actions/email",
            "{\"actionType\":\"SEND_EMAIL\",\"customerId\":\"?\",\"to\":\"?\",\"subject\":\"?\",\"body\":\"?\"}",
            1
        ));
        
        actionTypes.add(createActionType(
            "GENERATE_STATEMENT",
            "EKSTRE ÜRETİMİ",
            "Hesap ekstresi, işlem dökümü, bakiye raporu oluştur ve müşteriye ilet.",
            "Hesap ekstresini gönder lütfen, Ahmet'ten Veli'ye ait hesap hareketlerini istiyorum.",
            "/api/finance-actions/statement",
            "{\"actionType\":\"GENERATE_STATEMENT\",\"customerId\":\"?\",\"startDate\":\"?\",\"endDate\":\"?\",\"direction\":\"in|out\",\"minAmount\":\"?\",\"maxAmount\":\"?\",\"transactionType\":\"purchase|transfer|withdrawal|deposit|payment\",\"category\":\"shopping|groceries|entertainment|transportation|utilities|healthcare|education|salary|rent|investment|personal\",\"descriptionContains\":\"?\",\"limit\":\"?\",\"order\":\"asc|desc\",\"currency\":\"TRY|USD|EUR|GBP\"}",
            2
        ));
        
        actionTypes.add(createActionType(
            "SEND_PAYMENT_REMINDER",
            "ÖDEME HATIRLATMASI",
            "Geciken ödemeler için hatırlatma maili veya SMS gönder.",
            "Veli'nin kredi kartı borcunu hatırlat.",
            "/api/finance-actions/payment-reminder",
            "{\"recipientName\":\"Veli\",\"dueDate\":\"2025-06-01\",\"amount\":\"1500.00\"}",
            3
        ));
        
        actionTypes.add(createActionType(
            "CREATE_INVOICE",
            "FATURA OLUŞTURMA",
            "Belirli bir müşteri veya işlem için fatura oluştur ve maille ilet.",
            "Ahmet için son işlemlere ait fatura hazırla.",
            "/api/finance-actions/invoice",
            "{\"recipientName\":\"Ahmet\",\"invoiceId\":\"INV-20250525-001\"}",
            4
        ));
        
        actionTypes.add(createActionType(
            "PROCESS_PAYMENT",
            "ÖDEME İŞLEMİ",
            "Müşteriden ödeme al, ödeme durumu güncelle.",
            "Ahmet'in kredi kartı ödemesini işle.",
            "/api/finance-actions/payment",
            "{\"payerName\":\"Ahmet\",\"amount\":\"2000.00\",\"paymentMethod\":\"credit_card\"}",
            5
        ));
        
        actionTypes.add(createActionType(
            "REQUEST_LOAN_INFO",
            "KREDİ BİLGİSİ SORGULAMA",
            "Müşteri için kredi başvuru durumu, kredi limiti bilgisi sorgula ve raporla.",
            "Veli'nin kredi başvurusu ne durumda?",
            "/api/finance-actions/loan-info",
            "{\"customerName\":\"Veli\"}",
            6
        ));
        
        actionTypes.add(createActionType(
            "UPDATE_CONTACT_INFO",
            "İLETİŞİM BİLGİSİ GÜNCELLEME",
            "Müşterinin iletişim bilgilerini güncelle.",
            "Ahmet'in yeni e-posta adresini kaydet.",
            "/api/finance-actions/contact-info",
            "{\"customerName\":\"Ahmet\",\"newEmail\":\"ahmet.yeni@example.com\",\"newPhone\":\"+905551112233\"}",
            7
        ));
        
        actionTypes.add(createActionType(
            "GENERATE_FINANCIAL_REPORT",
            "FİNANSAL RAPOR OLUŞTURMA",
            "Şirket, müşteri veya portföy bazında finansal rapor hazırla (kâr/zarar, gelir tablosu vb.)",
            "Mart ayı finansal raporunu hazırla.",
            "/api/finance-actions/financial-report",
            "{\"companyId\":\"COMP-123\",\"reportPeriod\":\"2025-03\"}",
            8
        ));
        
        actionTypes.add(createActionType(
            "ALERT_FRAUD_DETECTION",
            "SAHTECİLİK TESPİTİ UYARISI",
            "Şüpheli işlem tespiti ve güvenlik uyarısı gönder.",
            "Veli'nin hesabında olağan dışı hareket var mı kontrol et.",
            "/api/finance-actions/fraud-alert",
            "{\"accountId\":\"ACC-987654\",\"transactionId\":\"TX-20250523-01\"}",
            9
        ));
        
        actionTypes.add(createActionType(
            "SCHEDULE_MEETING",
            "RANDEVU PLANLAMA",
            "Finansal danışman ile müşteri arasında toplantı ayarla.",
            "Ahmet için finansal danışmanla randevu oluştur.",
            "/api/finance-actions/meeting",
            "{\"customerName\":\"Ahmet\",\"advisorName\":\"Deniz\",\"meetingDate\":\"2025-06-10T14:00:00\"}",
            10
        ));
        
        actionTypes.add(createActionType(
            "TRANSFER_FUNDS",
            "PARA TRANSFERİ",
            "Hesaplar arası para transferi yap.",
            "Veli'nin tasarruf hesabından cari hesabına 5000 TL aktar.",
            "/api/finance-actions/transfer",
            "{\"fromAccountId\":\"ACC-123\",\"toAccountId\":\"ACC-456\",\"amount\":\"5000.00\"}",
            11
        ));
        
        actionTypes.add(createActionType(
            "NOTIFY_POLICY_CHANGE",
            "POLİTİKA DEĞİŞİKLİĞİ BİLDİRİMİ",
            "Hesap veya kredi politikalarında değişiklik bildirimi gönder.",
            "Kredi faiz oranlarındaki değişikliği müşterilere bildir.",
            "/api/finance-actions/policy-change",
            "{\"policyId\":\"POL-2025-01\",\"changeDescription\":\"Faiz oranı %1.5'ten %1.3'e düştü.\"}",
            12
        ));
        
        actionTypes.add(createActionType(
            "UPDATE_ACCOUNT_STATUS",
            "HESAP DURUMU GÜNCELLEME",
            "Hesap açma, kapama, askıya alma gibi durum güncellemeleri yap.",
            "Ahmet'in hesabını geçici olarak kapat.",
            "/api/finance-actions/account-status",
            "{\"accountId\":\"ACC-789\",\"newStatus\":\"suspended\"}",
            13
        ));
        
        actionTypes.add(createActionType(
            "UPLOAD_DOCUMENT",
            "BELGE YÜKLEME",
            "Müşteri tarafından gönderilen belgeleri sisteme yükle ve ilişkilendir.",
            "Veli'nin kimlik fotokopisini yükle.",
            "/api/finance-actions/document",
            "{\"customerName\":\"Veli\",\"documentType\":\"ID_CARD\",\"documentUrl\":\"https://example.com/docs/veli_id.pdf\"}",
            14
        ));
        
        actionTypes.add(createActionType(
            "CALCULATE_INTEREST",
            "FAİZ HESAPLAMA",
            "Belirli bir dönemin faiz hesaplamasını yap.",
            "Ahmet'in mevduat faizi ne kadar?",
            "/api/finance-actions/interest",
            "{\"accountId\":\"ACC-123\",\"periodStart\":\"2025-01-01\",\"periodEnd\":\"2025-03-31\"}",
            15
        ));
        
        actionTypes.add(createActionType(
            "GENERATE_TAX_REPORT",
            "VERGİ RAPORU OLUŞTURMA",
            "Vergi raporu veya formu hazırla ve gönder.",
            "Veli'nin gelir vergisi beyanı için rapor hazırla.",
            "/api/finance-actions/tax-report",
            "{\"customerName\":\"Veli\",\"taxYear\":\"2024\"}",
            16
        ));
        
        actionTypes.add(createActionType(
            "BLOCK_CARD",
            "KART ENGELLEME",
            "Kayıp veya çalıntı kart için kartı geçici olarak bloke et.",
            "Ahmet'in kredi kartını bloke et.",
            "/api/finance-actions/block-card",
            "{\"cardId\":\"CARD-5555\"}",
            17
        ));
        
        actionTypes.add(createActionType(
            "UNBLOCK_CARD",
            "KART ENGEL KALDIRMA",
            "Daha önce bloke edilen kartı tekrar aktif hale getir.",
            "Veli'nin kartını tekrar aç.",
            "/api/finance-actions/unblock-card",
            "{\"cardId\":\"CARD-5555\"}",
            18
        ));
        
        actionTypes.add(createActionType(
            "GENERATE_BUDGET_PLAN",
            "BÜTÇE PLANI OLUŞTURMA",
            "Müşteri için aylık veya yıllık bütçe planı hazırla.",
            "Ahmet için 2025 bütçe planı oluştur.",
            "/api/finance-actions/budget-plan",
            "{\"customerName\":\"Ahmet\",\"budgetYear\":\"2025\"}",
            19
        ));
        
        actionTypes.add(createActionType(
            "SEND_MARKETING_CAMPAIGN",
            "PAZARLAMA KAMPANYASI GÖNDERİMİ",
            "Yeni ürün, kampanya veya fırsat bilgisi içeren toplu mail/sms gönder.",
            "Tüm müşterilere yeni kredi kampanyasını bildir.",
            "/api/finance-actions/marketing-campaign",
            "{\"campaignId\":\"CMP-202505\",\"targetGroup\":\"all_customers\"}",
            20
        ));
        
        actionTypes.add(createActionType(
            "LOG_CUSTOMER_INTERACTION",
            "MÜŞTERİ ETKİLEŞİMİ KAYDETME",
            "Müşteri ile yapılan görüşmeler veya işlemler kayıt altına al.",
            "Ahmet ile yapılan telefon görüşmesini kaydet.",
            "/api/finance-actions/customer-interaction",
            "{\"customerName\":\"Ahmet\",\"interactionType\":\"phone_call\",\"notes\":\"Görüşme olumlu geçti.\"}",
            21
        ));
        
        financeActionTypeRepository.saveAll(actionTypes);
        log.info("Saved {} finance action types", actionTypes.size());
    }
    
    private FinanceActionType createActionType(String typeCode, String typeName, String description, 
                                             String samplePrompt, String endpointPath, 
                                             String jsonSchema, Integer sortOrder) {
        FinanceActionType actionType = new FinanceActionType();
        actionType.setTypeCode(typeCode);
        actionType.setTypeName(typeName);
        actionType.setDescription(description);
        actionType.setSamplePrompt(samplePrompt);
        actionType.setEndpointPath(endpointPath);
        actionType.setJsonSchema(jsonSchema);
        actionType.setIsActive(true);
        actionType.setSortOrder(sortOrder);
        return actionType;
    }
} 