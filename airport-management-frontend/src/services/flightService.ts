import axios from "axios";

const API_URL = "http://localhost:3001/api/flights";

export const flightService = {
  // Fetch all flights
  getAllFlights: async () => {
    const res = await axios.get(API_URL);
    if (!res.data.success) throw new Error("Failed to load flights");
    return res.data.data; // ✅ use .data.data instead of .data
  },

  // Calculate ticket price
  calculateTicketPrice: async (flightNumber: string, seatClass: string) => {
    const res = await axios.get(`${API_URL}/${flightNumber}/price/${seatClass}`);
    if (!res.data.success) throw new Error("Failed to calculate ticket price");
    return res.data; // returns { success, price }
  },
};
