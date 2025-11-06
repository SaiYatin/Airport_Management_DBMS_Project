// ================================================================
// FRONTEND API SERVICE (SUPER VERSION)
// File: src/services/api.ts
// ================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ================================================================
// Type Definitions
// ================================================================

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

export interface RequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  raw?: boolean; // if true, return full Response instead of parsed data
}

// ================================================================
// Utility Functions
// ================================================================

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, any>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

// Handle API responses safely
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response fallback
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return {
    data,
    status: response.status,
    statusText: response.statusText,
  };
}

// ================================================================
// Core API Client (Axios-like)
// ================================================================

export const api = {
  get: async <T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
    const url = buildUrl(endpoint, config?.params);
    const headers = { 'Content-Type': 'application/json', ...config?.headers };
    const response = await fetch(url, { method: 'GET', headers });
    return handleResponse<T>(response);
  },

  post: async <T = any>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    const url = buildUrl(endpoint, config?.params);
    const headers = { 'Content-Type': 'application/json', ...config?.headers };
    const response = await fetch(url, { method: 'POST', headers, body: body ? JSON.stringify(body) : undefined });
    return handleResponse<T>(response);
  },

  put: async <T = any>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    const url = buildUrl(endpoint, config?.params);
    const headers = { 'Content-Type': 'application/json', ...config?.headers };
    const response = await fetch(url, { method: 'PUT', headers, body: body ? JSON.stringify(body) : undefined });
    return handleResponse<T>(response);
  },

  patch: async <T = any>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    const url = buildUrl(endpoint, config?.params);
    const headers = { 'Content-Type': 'application/json', ...config?.headers };
    const response = await fetch(url, { method: 'PATCH', headers, body: body ? JSON.stringify(body) : undefined });
    return handleResponse<T>(response);
  },

  delete: async <T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
    const url = buildUrl(endpoint, config?.params);
    const headers = { 'Content-Type': 'application/json', ...config?.headers };
    const response = await fetch(url, { method: 'DELETE', headers });
    return handleResponse<T>(response);
  },
};

// ================================================================
// Simplified Direct API Function (Compatibility)
// ================================================================

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const response = await fetch(url, { ...options, headers });
  return handleResponse(response);
}

// ================================================================
// DOMAIN APIs
// ================================================================

// ---------------------- FLIGHTS ----------------------
export const flightApi = {
  getAll: () => apiCall('/flights'),
  getById: (flightNumber: string) => apiCall(`/flights/${flightNumber}`),
  add: (flightData: any) => apiCall('/flights', { method: 'POST', body: JSON.stringify(flightData) }),
  updateStatus: (flightNumber: string, status: string) =>
    apiCall(`/flights/${flightNumber}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getOccupancy: (flightNumber: string) => apiCall(`/flights/${flightNumber}/occupancy`),
  getAvailableSeats: (flightNumber: string) => apiCall(`/flights/${flightNumber}/available-seats`),
  getPrice: (flightNumber: string, seatClass: string) => apiCall(`/flights/${flightNumber}/price/${seatClass}`),
  getTicketsSold: (flightNumber: string) => apiCall(`/flights/${flightNumber}/tickets-sold`),
  getDistance: (departure: string, arrival: string) => apiCall(`/flights/${departure}/${arrival}/distance`),
};

// ---------------------- TICKETS ----------------------
export const ticketApi = {
  getAll: () => apiCall('/tickets'),
  book: (ticketData: any) => apiCall('/tickets/book', { method: 'POST', body: JSON.stringify(ticketData) }),
  cancel: (orderNumber: string, reason: string) =>
    apiCall(`/tickets/${orderNumber}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
};

// ---------------------- PASSENGERS ----------------------
export const passengerApi = {
  getAll: () => apiCall('/passengers'),
  getLoyaltyTier: (passengerId: number) => apiCall(`/passengers/${passengerId}/loyalty`),
};

// ---------------------- WORKERS ----------------------
export const workerApi = {
  getAll: () => apiCall('/workers'),
  hire: (workerData: any) => apiCall('/workers', { method: 'POST', body: JSON.stringify(workerData) }),
  calculateEarnings: (workerId: string, months: number = 12, bonus: number = 10) =>
    apiCall(`/workers/${workerId}/earnings?months=${months}&bonus=${bonus}`),
  checkPromotion: (workerId: string) => apiCall(`/workers/${workerId}/promotion`),
};

// ---------------------- AIRPORTS ----------------------
export const airportApi = {
  getAll: () => apiCall('/airports'),
  countWorkers: (airportId: string) => apiCall(`/airports/${airportId}/workers/count`),
};

// ---------------------- STORES ----------------------
export const storeApi = {
  getAll: () => apiCall('/stores'),
  getRating: (storeId: string) => apiCall(`/stores/${storeId}/rating`),
};

// ---------------------- FLIGHT COMPANIES ----------------------
export const flightCompanyApi = {
  getAll: () => apiCall('/flight-companies'),
  getRevenue: (companyId: string) => apiCall(`/flight-companies/${companyId}/revenue`),
};

// ---------------------- REPORTS ----------------------
export const reportApi = {
  generatePayroll: (airportId: string | null) =>
    apiCall('/reports/payroll', { method: 'POST', body: JSON.stringify({ airport_id: airportId }) }),
  generateFlightRevenue: (startDate: string, endDate: string) =>
    apiCall('/reports/flight-revenue', { method: 'POST', body: JSON.stringify({ start_date: startDate, end_date: endDate }) }),
};

// ---------------------- DASHBOARD ----------------------
export const dashboardApi = {
  getStats: () => apiCall('/dashboard/stats'),
};

// ---------------------- HEALTH CHECK ----------------------
export const healthApi = {
  check: () => apiCall('/health'),
};

// ================================================================
// USAGE EXAMPLES
// ================================================================

/*
// Using the axios-like api object:
const response = await api.get('/flights');
console.log(response.data);

// Using the domain APIs:
const flights = await flightApi.getAll();
const booking = await ticketApi.book({ passenger_id: 1, flight_id: 'AI101' });
*/
