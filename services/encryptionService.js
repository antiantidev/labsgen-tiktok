const { safeStorage } = require('electron');

class EncryptionService {
  static encrypt(plainText) {
    if (!plainText) return '';
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        return plainText; // Fallback nếu hệ thống không hỗ trợ (hiếm khi xảy ra trên Windows)
      }
      const buffer = safeStorage.encryptString(plainText);
      return buffer.toString('base64');
    } catch (err) {
      console.error('Encryption failed:', err);
      return plainText;
    }
  }

  static decrypt(encryptedBase64) {
    if (!encryptedBase64) return '';
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        return encryptedBase64;
      }
      const buffer = Buffer.from(encryptedBase64, 'base64');
      return safeStorage.decryptString(buffer);
    } catch (err) {
      // Nếu không decrypt được (có thể là text chưa mã hóa từ bản cũ), trả về chính nó
      return encryptedBase64;
    }
  }
}

module.exports = EncryptionService;
