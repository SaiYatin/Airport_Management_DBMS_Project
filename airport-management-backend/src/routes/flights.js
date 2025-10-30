const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all flights
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Flight ORDER BY flight_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new flight (calls stored procedure)
router.post('/', async (req, res) => {
  const { flight_number, departure_airport, arrival_airport, flight_date, departure_hour, arrival_hour, total_seats } = req.body;
  
  try {
    await pool.query(
      'CALL add_flight_schedule($1, $2, $3, $4, $5, $6, $7)',
      [flight_number, departure_airport, arrival_airport, flight_date, departure_hour, arrival_hour, total_seats]
    );
    res.json({ message: 'Flight added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update flight status
router.patch('/:flight_number/status', async (req, res) => {
  const { flight_number } = req.params;
  const { status } = req.body;
  
  try {
    await pool.query('CALL update_flight_status($1, $2)', [flight_number, status]);
    res.json({ message: 'Flight status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get flight occupancy
router.get('/:flight_number/occupancy', async (req, res) => {
  const { flight_number } = req.params;
  
  try {
    const result = await pool.query('SELECT get_flight_occupancy($1) as occupancy', [flight_number]);
    res.json({ occupancy: result.rows[0].occupancy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;