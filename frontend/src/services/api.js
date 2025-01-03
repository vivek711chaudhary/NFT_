import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async createListing(tokenId, price, metadata, seller) {
    try {
      const response = await api.post('/listings', {
        tokenId,
        price,
        metadata,
        seller,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create listing:', error);
      throw error;
    }
  },

  async getListing(id) {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get listing:', error);
      throw error;
    }
  },

  async getListings() {
    try {
      const response = await api.get('/listings');
      return response.data;
    } catch (error) {
      console.error('Failed to get listings:', error);
      throw error;
    }
  },

  async storeNFTMetadata(metadata, owner) {
    try {
      const response = await api.post('/nft/metadata', {
        metadata,
        owner,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to store NFT metadata:', error);
      throw error;
    }
  },

  async getNFTMetadata(id) {
    try {
      const response = await api.get(`/nft/metadata/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      throw error;
    }
  },
};
