import { api } from './api';

export const reportService = {
  // Generate payroll report (calls generate_payroll_report procedure)
  generatePayrollReport: async (airportId?: string, dateFrom?: string, dateTo?: string) => {
    const response = await api.post('/reports/payroll', {
      airportId,
      dateFrom,
      dateTo
    });
    return response.data;
  },

  // Generate flight revenue report (calls generate_flight_revenue_report procedure)
  generateFlightRevenueReport: async (dateFrom: string, dateTo: string) => {
    const response = await api.post('/reports/flight-revenue', {
      dateFrom,
      dateTo
    });
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async (role: string) => {
    const response = await api.get('/reports/dashboard-stats', {
      params: { role }
    });
    return response.data;
  },
};
