const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Book ticket
router.post('/book', async (req, res) => {
  const { order_number, passenger_name, email, phone, age, seat_class, flight_number, flight_company_id, seat_number } = req.body;
  
  try {
    await pool.query(
      'CALL book_ticket($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [order_number, passenger_name, email, phone, age, seat_class, flight_number, flight_company_id, seat_number]
    );
    res.json({ message: 'Ticket booked successfully', order_number });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel ticket
router.post('/:order_number/cancel', async (req, res) => {
  const { order_number } = req.params;
  const { reason } = req.body;
  
  try {
    await pool.query('CALL cancel_ticket($1, $2)', [order_number, reason]);
    res.json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;