import { api } from './api';

export const storeService = {
  // Get all stores
  getAllStores: async (filters?: {
    airport?: string;
    storeType?: string;
    performanceRating?: string;
  }) => {
    const response = await api.get('/stores', { params: filters });
    return response.data;
  },

  // Get store by ID
  getStoreById: async (storeId: number) => {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  },

  // Get store performance rating (calls get_store_performance_rating function)
  getStorePerformanceRating: async (storeId: number) => {
    const response = await api.get(`/stores/${storeId}/performance-rating`);
    return response.data;
  },

  // Get store employees
  getStoreEmployees: async (storeId: number) => {
    const response = await api.get(`/stores/${storeId}/employees`);
    return response.data;
  },
};
