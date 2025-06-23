# 🚀 Agent Automation System - Production Deployment Guide

## 📋 Genel Bakış

Bu rehber, Agent Automation System'ini production ortamında Docker kullanarak deploy etme sürecini açıklar.

## 🏗️ Sistem Mimarisi

### Servisler:
- **AI Provider** (8082): AI servisleri ve model yönetimi
- **Agent Provider** (8081): Agent işlemleri ve external API entegrasyonları
- **MCP Provider** (8083): Database işlemleri ve finans uygulamaları
- **Frontend** (3000): Next.js tabanlı React uygulaması
- **PostgreSQL** (5432): Veritabanı
- **Nginx** (80/443): Reverse proxy ve load balancer

### Bağımlılıklar:
```
Frontend → Agent Provider → AI Provider
         → MCP Provider → AI Provider
                       → PostgreSQL
```

## 🔧 Kurulum

### 1. Gereksinimler
- Docker ve Docker Compose kurulu olmalı
- En az 4GB RAM ve 10GB disk alanı
- Gerekli API anahtarları

### 2. Environment Değişkenleri
```bash
# .env.example dosyasını kopyalayın
cp .env.example .env

# Gerekli değişkenleri düzenleyin
nano .env
```

### 3. Deployment
```bash
# Deploy scriptini çalıştırın
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 📊 Monitoring ve Maintenance

### Sistem Monitoring
```bash
# Real-time monitoring
chmod +x scripts/monitor.sh
./scripts/monitor.sh

# Logları görüntüleme
docker-compose logs -f [service-name]

# Tüm servislerin logları
docker-compose logs -f
```

### Database Backup
```bash
# Backup oluşturma
chmod +x scripts/backup.sh
./scripts/backup.sh

# Backup'ları görüntüleme
ls -la backups/
```

## 🔒 Security

### SSL Konfigürasyonu
1. SSL sertifikalarını `nginx/ssl/` dizinine yerleştirin
2. `nginx/nginx.conf` dosyasında HTTPS bloğunu aktif edin
3. Nginx'i yeniden başlatın

### Environment Variables
- Tüm API anahtarlarını `.env` dosyasında saklayın
- Production'da güçlü şifreler kullanın
- Hassas bilgileri asla commit etmeyin

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.yml içinde replica sayısını artırın
ai-provider:
  deploy:
    replicas: 3
```

### Vertical Scaling
```yaml
# Resource limitleri ayarlayın
ai-provider:
  deploy:
    resources:
      limits:
        memory: 2G
        cpus: '1.0'
```

## 🛠️ Troubleshooting

### Yaygın Sorunlar

1. **Servis başlamıyor**
   ```bash
   docker-compose logs [service-name]
   ```

2. **Database bağlantı hatası**
   ```bash
   # Postgres sağlık kontrolü
   docker-compose exec postgres pg_isready -U postgres
   ```

3. **Memory yetersizliği**
   ```bash
   # Container kaynak kullanımı
   docker stats
   ```

### Health Check Endpoints
- Frontend: `http://localhost:3000/api/health`
- AI Provider: `http://localhost:8082/ai-provider/actuator/health`
- Agent Provider: `http://localhost:8081/agent-provider/actuator/health`
- MCP Provider: `http://localhost:8083/mcp-provider/actuator/health`

## 🔄 Update Procedure

### Rolling Update
```bash
# Yeni kodu çek
git pull origin main

# Servisleri güncelle
docker-compose up --build -d

# Health check
curl -f http://localhost/health
```

### Zero-Downtime Deployment
```bash
# Blue-green deployment için
docker-compose -f docker-compose.blue.yml up -d
# Test et
# Traffic'i yönlendir
# Eski versiyonu kapat
```

## 📝 Maintenance Tasks

### Günlük
- [ ] Sistem health check
- [ ] Log rotasyonu kontrolü
- [ ] Disk alanı kontrolü

### Haftalık
- [ ] Database backup
- [ ] Security update kontrolü
- [ ] Performance metrikleri inceleme

### Aylık
- [ ] Kapsamlı sistem backup
- [ ] Dependency update'leri
- [ ] Sistem performans analizi

## 🚨 Disaster Recovery

### Backup Stratejisi
1. **Günlük** database backup
2. **Haftalık** full system backup
3. **Aylık** offsite backup

### Recovery Procedure
```bash
# Database restore
docker-compose exec postgres psql -U postgres -d mcp_db < backup.sql

# Full system restore
docker-compose down
# Restore volumes
docker-compose up -d
```

## 📞 Support

Sorunlar için:
1. Önce logs kontrol edin
2. Health check endpoint'lerini test edin
3. GitHub Issues'da sorun bildirin
4. Monitoring dashboard'ları kontrol edin

## 🔗 Useful Commands

```bash
# Tüm servisleri başlat
docker-compose up -d

# Servisleri durdur
docker-compose down

# Logları izle
docker-compose logs -f

# Tek servis restart
docker-compose restart [service-name]

# Database shell
docker-compose exec postgres psql -U postgres -d mcp_db

# Container içine gir
docker-compose exec [service-name] bash
``` 