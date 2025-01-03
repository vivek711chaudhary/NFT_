import { CalimeroSDK } from '@calimero/sdk';

class CalimeroService {
  constructor() {
    this.sdk = new CalimeroSDK({
      apiKey: process.env.REACT_APP_CALIMERO_API_KEY,
      networkId: process.env.REACT_APP_CALIMERO_NETWORK_ID
    });
  }

  async encryptMetadata(metadata) {
    try {
      return await this.sdk.encrypt(JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to encrypt metadata:', error);
      throw error;
    }
  }

  async decryptMetadata(encryptedMetadata) {
    try {
      const decrypted = await this.sdk.decrypt(encryptedMetadata);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt metadata:', error);
      throw error;
    }
  }

  async storePrivateData(data, accessControl) {
    try {
      const result = await this.sdk.storePrivateData({
        data: JSON.stringify(data),
        accessControl
      });
      return result.hash;
    } catch (error) {
      console.error('Failed to store private data:', error);
      throw error;
    }
  }

  async retrievePrivateData(hash) {
    try {
      const encryptedData = await this.sdk.retrievePrivateData(hash);
      return this.decryptMetadata(encryptedData);
    } catch (error) {
      console.error('Failed to retrieve private data:', error);
      throw error;
    }
  }
}

export const calimeroService = new CalimeroService();
