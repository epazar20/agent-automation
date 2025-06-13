-- Önce mevcut veriyi temizleyelim çünkü bozuk
UPDATE email_attachments SET base64_content = NULL;

-- base64_content kolonunu TEXT (CLOB) tipine çevirelim
ALTER TABLE email_attachments ALTER COLUMN base64_content TYPE TEXT; 