import { api } from './api';

export const airportService = {
  // Get all airports
  getAllAirports: async () => {
    const response = await api.get('/airports');
    return response.data;
  },

  // Get airport by ID
  getAirportById: async (airportId: string) => {
    const response = await api.get(`/airports/${airportId}`);
    return response.data;
  },

  // Count airport workers (calls count_airport_workers function)
  countAirportWorkers: async (airportId: string) => {
    const response = await api.get(`/airports/${airportId}/workers/count`);
    return response.data;
  },

  // Get airport statistics
  getAirportStats: async (airportId: string) => {
    const response = await api.get(`/airports/${airportId}/stats`);
    return response.data;
  },
};
