import * as storage from '@/lib/storage';

export const tokenCache = {
  async getToken(key: string) {
    try {
      return await storage.getItem(key);
    } catch (error) {
      console.error('Token cache get error:', error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await storage.setItem(key, value);
    } catch (err) {
      console.error('Token cache save error:', err);
      throw new Error('Failed to save authentication token');
    }
  },
};
