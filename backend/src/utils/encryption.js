const CryptoJS = require('crypto-js');

class EncryptionService {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  encrypt(data) {
    try {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return CryptoJS.AES.encrypt(jsonStr, this.secretKey).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      try {
        return JSON.parse(decryptedStr);
      } catch {
        return decryptedStr;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Generate a unique encryption key for each user
  generateUserKey(address) {
    return CryptoJS.SHA256(address + this.secretKey).toString();
  }

  // Encrypt data with user-specific key
  encryptForUser(data, userAddress) {
    const userKey = this.generateUserKey(userAddress);
    return this.encrypt(data, userKey);
  }

  // Decrypt data with user-specific key
  decryptForUser(encryptedData, userAddress) {
    const userKey = this.generateUserKey(userAddress);
    return this.decrypt(encryptedData, userKey);
  }
}

module.exports = EncryptionService;
