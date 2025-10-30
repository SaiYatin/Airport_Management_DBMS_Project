import { api } from './api';

export interface BookTicketData {
  passenger_id?: number;
  passenger_name?: string;
  passenger_email?: string;
  passenger_phone?: string;
  passenger_age?: number;
  flight_number: string;
  seat_number: string;
  seat_class: string;
  ticket_price: number;
}

export interface CancelTicketData {
  order_number: string;
  cancellation_reason: string;
}

export const ticketService = {
  // Get all tickets
  getAllTickets: async (filters?: {
    passenger?: string;
    flight?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    seatClass?: string;
  }) => {
    const response = await api.get('/tickets', { params: filters });
    return response.data;
  },

  // Get ticket by order number
  getTicketByOrderNumber: async (orderNumber: string) => {
    const response = await api.get(`/tickets/${orderNumber}`);
    return response.data;
  },

  // Book ticket (calls book_ticket procedure)
  bookTicket: async (ticketData: BookTicketData) => {
    const response = await api.post('/tickets/book', ticketData);
    return response.data;
  },

  // Cancel ticket (calls cancel_ticket procedure)
  cancelTicket: async (cancelData: CancelTicketData) => {
    const response = await api.post('/tickets/cancel', cancelData);
    return response.data;
  },

  // Get passenger loyalty tier (calls get_passenger_loyalty_tier function)
  getPassengerLoyaltyTier: async (passengerId: number) => {
    const response = await api.get(`/passengers/${passengerId}/loyalty-tier`);
    return response.data;
  },

  // Get all passengers
  getAllPassengers: async (search?: string) => {
    const response = await api.get('/passengers', { params: { search } });
    return response.data;
  },

  // Get passenger by ID
  getPassengerById: async (passengerId: number) => {
    const response = await api.get(`/passengers/${passengerId}`);
    return response.data;
  },

  // Search passengers by email
  searchPassengerByEmail: async (email: string) => {
    const response = await api.get('/passengers/search', { params: { email } });
    return response.data;
  },
};
