// ================================================================
// FRONTEND API SERVICE - Connects to Backend
// File: src/services/api.ts
// ================================================================

const API_BASE_URL = 'http://localhost:3001/api';

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }
    
    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ================================================================
// FLIGHT APIs
// ================================================================

export const flightApi = {
  // Get all flights
  getAll: () => apiCall('/flights'),
  
  // Get flight by ID
  getById: (flightNumber: string) => apiCall(`/flights/${flightNumber}`),
  
  // Add new flight (calls stored procedure)
  add: (flightData: {
    flight_number: string;
    departure_airport: string;
    arrival_airport: string;
    flight_date: string;
    departure_hour: string;
    arrival_hour: string;
    total_seats: number;
  }) => apiCall('/flights', {
    method: 'POST',
    body: JSON.stringify(flightData),
  }),
  
  // Update flight status (calls stored procedure)
  updateStatus: (flightNumber: string, status: string) => 
    apiCall(`/flights/${flightNumber}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  
  // Get flight occupancy (calls function)
  getOccupancy: (flightNumber: string) => 
    apiCall(`/flights/${flightNumber}/occupancy`),
  
  // Get available seats (calls function)
  getAvailableSeats: (flightNumber: string) => 
    apiCall(`/flights/${flightNumber}/available-seats`),
  
  // Get dynamic ticket price (calls function)
  getPrice: (flightNumber: string, seatClass: string) => 
    apiCall(`/flights/${flightNumber}/price/${seatClass}`),
  
  // Get tickets sold (calls function)
  getTicketsSold: (flightNumber: string) => 
    apiCall(`/flights/${flightNumber}/tickets-sold`),
  
  // Get flight distance (calls function)
  getDistance: (departure: string, arrival: string) => 
    apiCall(`/flights/${departure}/${arrival}/distance`),
};

// ================================================================
// TICKET APIs
// ================================================================

export const ticketApi = {
  // Get all tickets
  getAll: () => apiCall('/tickets'),
  
  // Book ticket (calls stored procedure)
  book: (ticketData: {
    order_number: string;
    passenger_name: string;
    email: string;
    phone: string;
    age: number;
    seat_class: string;
    flight_number: string;
    flight_company_id: string;
    seat_number: string;
  }) => apiCall('/tickets/book', {
    method: 'POST',
    body: JSON.stringify(ticketData),
  }),
  
  // Cancel ticket (calls stored procedure)
  cancel: (orderNumber: string, reason: string) => 
    apiCall(`/tickets/${orderNumber}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// ================================================================
// PASSENGER APIs
// ================================================================

export const passengerApi = {
  // Get all passengers
  getAll: () => apiCall('/passengers'),
  
  // Get passenger loyalty tier (calls function)
  getLoyaltyTier: (passengerId: number) => 
    apiCall(`/passengers/${passengerId}/loyalty`),
};

// ================================================================
// WORKER APIs
// ================================================================

export const workerApi = {
  // Get all workers
  getAll: () => apiCall('/workers'),
  
  // Hire worker (calls stored procedure)
  hire: (workerData: {
    worker_id: string;
    name: string;
    age: number;
    job: string;
    payment: number;
    store_id: string | null;
    airport_id: string;
  }) => apiCall('/workers', {
    method: 'POST',
    body: JSON.stringify(workerData),
  }),
  
  // Calculate worker earnings (calls function)
  calculateEarnings: (workerId: string, months: number = 12, bonus: number = 10) => 
    apiCall(`/workers/${workerId}/earnings?months=${months}&bonus=${bonus}`),
  
  // Check promotion eligibility (calls function)
  checkPromotion: (workerId: string) => 
    apiCall(`/workers/${workerId}/promotion`),
};

// ================================================================
// AIRPORT APIs
// ================================================================

export const airportApi = {
  // Get all airports
  getAll: () => apiCall('/airports'),
  
  // Count airport workers (calls function)
  countWorkers: (airportId: string) => 
    apiCall(`/airports/${airportId}/workers/count`),
};

// ================================================================
// STORE APIs
// ================================================================

export const storeApi = {
  // Get all stores
  getAll: () => apiCall('/stores'),
  
  // Get store performance rating (calls function)
  getRating: (storeId: string) => 
    apiCall(`/stores/${storeId}/rating`),
};

// ================================================================
// FLIGHT COMPANY APIs
// ================================================================

export const flightCompanyApi = {
  // Get all flight companies
  getAll: () => apiCall('/flight-companies'),
  
  // Get company revenue (calls function)
  getRevenue: (companyId: string) => 
    apiCall(`/flight-companies/${companyId}/revenue`),
};

// ================================================================
// REPORT APIs
// ================================================================

export const reportApi = {
  // Generate payroll report (calls stored procedure)
  generatePayroll: (airportId: string | null) => 
    apiCall('/reports/payroll', {
      method: 'POST',
      body: JSON.stringify({ airport_id: airportId }),
    }),
  
  // Generate flight revenue report (calls stored procedure)
  generateFlightRevenue: (startDate: string, endDate: string) => 
    apiCall('/reports/flight-revenue', {
      method: 'POST',
      body: JSON.stringify({ start_date: startDate, end_date: endDate }),
    }),
};

// ================================================================
// DASHBOARD APIs
// ================================================================

export const dashboardApi = {
  // Get dashboard statistics
  getStats: () => apiCall('/dashboard/stats'),
};

// ================================================================
// HEALTH CHECK
// ================================================================

export const healthApi = {
  check: () => apiCall('/health'),
};

// ================================================================
// USAGE EXAMPLES
// ================================================================

/*
// Example 1: Get all flights
const flights = await flightApi.getAll();

// Example 2: Book a ticket (demonstrates stored procedure + trigger)
const booking = await ticketApi.book({
  order_number: 'TKT_001',
  passenger_name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  age: 30,
  seat_class: 'economy',
  flight_number: 'AI101',
  flight_company_id: 'FC001',
  seat_number: '12A'
});

// Example 3: Get flight occupancy (demonstrates function)
const occupancy = await flightApi.getOccupancy('AI101');
console.log(`Occupancy: ${occupancy.occupancy}%`);

// Example 4: Calculate dynamic price (demonstrates function)
const price = await flightApi.getPrice('AI101', 'business');
console.log(`Price: ₹${price.price}`);

// Example 5: Check worker promotion eligibility (demonstrates function)
const eligible = await workerApi.checkPromotion('W001');
console.log(`Eligible for promotion: ${eligible.eligible}`);

// Example 6: Generate payroll report (demonstrates stored procedure)
const payroll = await reportApi.generatePayroll('BLR');

// Example 7: Cancel ticket (demonstrates stored procedure + multiple triggers)
const cancellation = await ticketApi.cancel('TKT_005', 'Change of plans');
*/