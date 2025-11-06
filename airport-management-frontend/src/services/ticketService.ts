import axios from "axios";

const API_URL = "http://localhost:3001/api/tickets";

export const ticketService = {
  bookTicket: async (data: any) => {
    const res = await axios.post(API_URL, data);
    if (!res.data.success) throw new Error("Ticket booking failed");
    return res.data;
  },
};
