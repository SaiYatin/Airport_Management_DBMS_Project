import { api } from './api';

export interface Flight {
  flight_number: string;
  departure_airport_id: string;
  arrival_airport_id: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  total_seats: number;
  available_seats: number;
  status: string;
  company?: string;
}

export const flightService = {
  // Get all flights
  getAllFlights: async (filters?: {
    date?: string;
    airport?: string;
    status?: string;
    company?: string;
  }) => {
    const response = await api.get('/flights', { params: filters });
    return response.data;
  },

  // Get flight by number
  getFlightById: async (flightNumber: string) => {
    const response = await api.get(`/flights/${flightNumber}`);
    return response.data;
  },

  // Add new flight (calls add_flight_schedule procedure)
  addFlight: async (flightData: Omit<Flight, 'available_seats'>) => {
    const response = await api.post('/flights', flightData);
    return response.data;
  },

  // Update flight status (calls update_flight_status procedure)
  updateFlightStatus: async (flightNumber: string, status: string) => {
    const response = await api.patch(`/flights/${flightNumber}/status`, { status });
    return response.data;
  },

  // Get flight occupancy percentage (calls get_flight_occupancy function)
  getFlightOccupancy: async (flightNumber: string) => {
    const response = await api.get(`/flights/${flightNumber}/occupancy`);
    return response.data;
  },

  // Get tickets sold for a flight (calls get_tickets_sold function)
  getTicketsSold: async (flightNumber: string) => {
    const response = await api.get(`/flights/${flightNumber}/tickets-sold`);
    return response.data;
  },

  // Get available seats (calls get_available_seats function)
  getAvailableSeats: async (flightNumber: string) => {
    const response = await api.get(`/flights/${flightNumber}/available-seats`);
    return response.data;
  },

  // Calculate dynamic ticket price (calls calculate_dynamic_ticket_price function)
  calculateTicketPrice: async (flightNumber: string, seatClass: string) => {
    const response = await api.get(`/flights/${flightNumber}/price`, {
      params: { seatClass }
    });
    return response.data;
  },

  // Get flight distance (calls get_flight_distance_km function)
  getFlightDistance: async (flightNumber: string) => {
    const response = await api.get(`/flights/${flightNumber}/distance`);
    return response.data;
  },

  // Get company revenue (calls get_company_revenue function)
  getCompanyRevenue: async (companyName: string) => {
    const response = await api.get(`/flights/company/${companyName}/revenue`);
    return response.data;
  },
};
