import { api } from './api';

export interface Worker {
  worker_id: string;
  worker_name: string;
  age: number;
  job: string;
  payment: number;
  store_id?: number;
  airport_id: string;
  status?: string;
  hire_date?: string;
}

export const workerService = {
  // Get all workers
  getAllWorkers: async (filters?: {
    airport?: string;
    store?: string;
    job?: string;
    status?: string;
  }) => {
    const response = await api.get('/workers', { params: filters });
    return response.data;
  },

  // Get worker by ID
  getWorkerById: async (workerId: string) => {
    const response = await api.get(`/workers/${workerId}`);
    return response.data;
  },

  // Hire new worker (calls hire_worker procedure)
  hireWorker: async (workerData: Worker) => {
    const response = await api.post('/workers', workerData);
    return response.data;
  },

  // Check if worker is eligible for promotion (calls is_eligible_for_promotion function)
  checkPromotionEligibility: async (workerId: string) => {
    const response = await api.get(`/workers/${workerId}/promotion-eligibility`);
    return response.data;
  },

  // Calculate worker earnings (calls calculate_worker_earnings function)
  calculateWorkerEarnings: async (workerId: string, months: number, bonusPercentage: number) => {
    const response = await api.get(`/workers/${workerId}/earnings`, {
      params: { months, bonusPercentage }
    });
    return response.data;
  },

  // Get all promotion eligible workers
  getPromotionEligibleWorkers: async () => {
    const response = await api.get('/workers/promotion-eligible');
    return response.data;
  },
};
