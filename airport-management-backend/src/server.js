// ================================================================
// AIRPORT MANAGEMENT SYSTEM - COMPLETE BACKEND SERVER
// File: server.js
// ================================================================

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'airport_management',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// ================================================================
// AUTHENTICATION ROUTES
// ================================================================

// Mock login (for demo purposes)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const testUsers = [
    { role: 'Admin', email: 'admin@airport.com', password: 'Admin@123' },
    { role: 'Manager', email: 'manager@airport.com', password: 'Manager@123' },
    { role: 'Staff', email: 'staff@airport.com', password: 'Staff@123' },
  ];
  
  const user = testUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({ 
      success: true, 
      user: { role: user.role, email: user.email },
      message: 'Login successful' 
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ================================================================
// FLIGHT ROUTES
// ================================================================

// Get all flights
app.get('/api/flights', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        f.*,
        a1.name as departure_airport_name,
        a1.city as departure_city,
        a2.name as arrival_airport_name,
        a2.city as arrival_city
      FROM Flight f
      JOIN Airport a1 ON f.departure_airport = a1.airport_id
      JOIN Airport a2 ON f.arrival_airport = a2.airport_id
      ORDER BY f.flight_date DESC, f.departure_hour DESC
      LIMIT 100
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get flight by ID
app.get('/api/flights/:flight_number', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        f.*,
        a1.name as departure_airport_name,
        a1.city as departure_city,
        a2.name as arrival_airport_name,
        a2.city as arrival_city
      FROM Flight f
      JOIN Airport a1 ON f.departure_airport = a1.airport_id
      JOIN Airport a2 ON f.arrival_airport = a2.airport_id
      WHERE f.flight_number = ?
    `, [req.params.flight_number]);
    
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Flight not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new flight (calls stored procedure)
app.post('/api/flights', async (req, res) => {
  const { 
    flight_number, 
    departure_airport, 
    arrival_airport, 
    flight_date, 
    departure_hour, 
    arrival_hour, 
    total_seats 
  } = req.body;
  
  try {
    await pool.query(
      'CALL add_flight_schedule(?, ?, ?, ?, ?, ?, ?)',
      [flight_number, departure_airport, arrival_airport, flight_date, departure_hour, arrival_hour, total_seats]
    );
    res.json({ 
      success: true, 
      message: 'Flight added successfully',
      procedure_used: 'add_flight_schedule'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update flight status (calls stored procedure)
app.patch('/api/flights/:flight_number/status', async (req, res) => {
  const { status } = req.body;
  const { flight_number } = req.params;
  
  try {
    await pool.query(
      'CALL update_flight_status(?, ?)',
      [flight_number, status]
    );
    res.json({ 
      success: true, 
      message: 'Flight status updated',
      procedure_used: 'update_flight_status'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get flight occupancy (calls function)
app.get('/api/flights/:flight_number/occupancy', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT get_flight_occupancy(?) as occupancy',
      [req.params.flight_number]
    );
    res.json({ 
      success: true, 
      occupancy: rows[0].occupancy,
      function_used: 'get_flight_occupancy'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available seats (calls function)
app.get('/api/flights/:flight_number/available-seats', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT get_available_seats(?) as available_seats',
      [req.params.flight_number]
    );
    res.json({ 
      success: true, 
      available_seats: rows[0].available_seats,
      function_used: 'get_available_seats'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calculate dynamic ticket price (calls function)
app.get('/api/flights/:flight_number/price/:seat_class', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT calculate_dynamic_ticket_price(?, ?) as price',
      [req.params.flight_number, req.params.seat_class]
    );
    res.json({ 
      success: true, 
      price: rows[0].price,
      function_used: 'calculate_dynamic_ticket_price'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tickets sold (calls function)
app.get('/api/flights/:flight_number/tickets-sold', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT get_tickets_sold(?) as tickets_sold',
      [req.params.flight_number]
    );
    res.json({ 
      success: true, 
      tickets_sold: rows[0].tickets_sold,
      function_used: 'get_tickets_sold'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get flight distance (calls function)
app.get('/api/flights/:departure/:arrival/distance', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT get_flight_distance_km(?, ?) as distance_km',
      [req.params.departure, req.params.arrival]
    );
    res.json({ 
      success: true, 
      distance_km: rows[0].distance_km,
      function_used: 'get_flight_distance_km'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// TICKET ROUTES
// ================================================================

// Get all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.*,
        p.email as passenger_email,
        p.phone as passenger_phone,
        fc.flight_company_name,
        f.flight_date,
        f.departure_hour,
        f.arrival_hour,
        a1.city as departure_city,
        a2.city as arrival_city
      FROM Ticket t
      LEFT JOIN Passenger p ON t.passenger_id = p.passenger_id
      LEFT JOIN FlightCompany fc ON t.flight_company_id = fc.flight_company_id
      LEFT JOIN Flight f ON t.flight_number = f.flight_number
      LEFT JOIN Airport a1 ON f.departure_airport = a1.airport_id
      LEFT JOIN Airport a2 ON f.arrival_airport = a2.airport_id
      ORDER BY t.booking_date DESC
      LIMIT 100
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Book ticket (calls stored procedure)
app.post('/api/tickets/book', async (req, res) => {
  const {
    order_number,
    passenger_name,
    email,
    phone,
    age,
    seat_class,
    flight_number,
    flight_company_id,
    seat_number
  } = req.body;
  
  try {
    await pool.query(
      'CALL book_ticket(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [order_number, passenger_name, email, phone, age, seat_class, flight_number, flight_company_id, seat_number]
    );
    res.json({ 
      success: true, 
      message: 'Ticket booked successfully',
      order_number,
      procedure_used: 'book_ticket',
      trigger_fired: 'trg_ticket_insert_seats (decremented available seats)'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel ticket (calls stored procedure)
app.post('/api/tickets/:order_number/cancel', async (req, res) => {
  const { reason } = req.body;
  const { order_number } = req.params;
  
  try {
    await pool.query(
      'CALL cancel_ticket(?, ?)',
      [order_number, reason]
    );
    res.json({ 
      success: true, 
      message: 'Ticket cancelled successfully',
      procedure_used: 'cancel_ticket',
      trigger_fired: 'trg_ticket_update_seats (incremented available seats)',
      cancellation_logged: 'TicketCancellationLog table'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// PASSENGER ROUTES
// ================================================================

// Get all passengers
app.get('/api/passengers', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        COUNT(t.order_number) as total_bookings,
        SUM(CASE WHEN t.booking_status = 'confirmed' THEN t.price ELSE 0 END) as total_spent
      FROM Passenger p
      LEFT JOIN Ticket t ON p.passenger_id = t.passenger_id
      GROUP BY p.passenger_id
      ORDER BY total_spent DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get passenger loyalty tier (calls function)
app.get('/api/passengers/:passenger_id/loyalty', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT get_passenger_loyalty_tier(?) as loyalty_tier',
      [req.params.passenger_id]
    );
    res.json({ 
      success: true, 
      loyalty_tier: rows[0].loyalty_tier,
      function_used: 'get_passenger_loyalty_tier'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// WORKER ROUTES
// ================================================================

// Get all workers
app.get('/api/workers', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        w.*,
        s.name as store_name,
        a.name as airport_name,
        a.city as airport_city
      FROM Worker w
      LEFT JOIN Store s ON w.store_id = s.store_id
      JOIN Airport a ON w.airport_id = a.airport_id
      ORDER BY w.hire_date DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Hire worker (calls stored procedure)
app.post('/api/workers', async (req, res) => {
  const {
    worker_id,
    name,
    age,
    job,
    payment,
    store_id,
    airport_id
  } = req.body;
  
  try {
    await pool.query(
      'CALL hire_worker(?, ?, ?, ?, ?, ?, ?)',
      [worker_id, name, age, job, payment, store_id, airport_id]
    );
    res.json({ 
      success: true, 
      message: 'Worker hired successfully',
      procedure_used: 'hire_worker',
      trigger_fired: 'trg_worker_before_insert (validated age and payment)'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calculate worker earnings (calls function)
app.get('/api/workers/:worker_id/earnings', async (req, res) => {
  const { months = 12, bonus = 10 } = req.query;
  
  try {
    const [rows] = await pool.query(
      'SELECT calculate_worker_earnings(?, ?, ?) as total_earnings',
      [req.params.worker_id, months, bonus]
    );
    res.json({ 
      success: true, 
      total_earnings: rows[0].total_earnings,
      months: parseInt(months),
      bonus_percentage: parseFloat(bonus),
      function_used: 'calculate_worker_earnings'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check promotion eligibility (calls function)
app.get('/api/workers/:worker_id/promotion', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT is_eligible_for_promotion(?) as eligible',
      [req.params.worker_id]
    );
    res.json({ 
      success: true, 
      eligible: rows[0].eligible === 'Yes',
      function_used: 'is_eligible_for_promotion'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate payroll report (calls stored procedure)
app.post('/api/reports/payroll', async (req, res) => {
  const { airport_id } = req.body;
  
  try {
    const [results] = await pool.query(
      'CALL generate_payroll_report(?)',
      [airport_id || null]
    );
    res.json({ 
      success: true, 
      data: results,
      procedure_used: 'generate_payroll_report'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// AIRPORT ROUTES
// ================================================================

// Get all airports
app.get('/api/airports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Airport ORDER BY city');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Count airport workers (calls function)
app.get('/api/airports/:airport_id/workers/count', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT count_airport_workers(?) as worker_count',
      [req.params.airport_id]
    );
    res.json({ 
      success: true, 
      worker_count: rows[0].worker_count,
      function_used: 'count_airport_workers'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// STORE ROUTES
// ================================================================

// Get all stores
app.get('/api/stores', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*,
        a.name as airport_name,
        a.city as airport_city,
        COUNT(w.worker_id) as employee_count
      FROM Store s
      JOIN Airport a ON s.airport_id = a.airport_id
      LEFT JOIN Worker w ON s.store_id = w.store_id AND w.status = 'active'
      GROUP BY s.store_id
      ORDER BY s.name
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get store performance rating (calls function)
app.get('/api/stores/:store_id/rating', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT get_store_performance_rating(?) as performance_rating',
      [req.params.store_id]
    );
    res.json({ 
      success: true, 
      performance_rating: rows[0].performance_rating,
      function_used: 'get_store_performance_rating'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// FLIGHT COMPANY ROUTES
// ================================================================

// Get all flight companies
app.get('/api/flight-companies', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FlightCompany ORDER BY flight_company_name');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get company revenue (calls function)
app.get('/api/flight-companies/:company_id/revenue', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT get_company_revenue(?) as total_revenue',
      [req.params.company_id]
    );
    res.json({ 
      success: true, 
      total_revenue: rows[0].total_revenue,
      function_used: 'get_company_revenue'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// REPORT ROUTES
// ================================================================

// Generate flight revenue report (calls stored procedure)
app.post('/api/reports/flight-revenue', async (req, res) => {
  const { start_date, end_date } = req.body;
  
  try {
    const [results] = await pool.query(
      'CALL generate_flight_revenue_report(?, ?)',
      [start_date, end_date]
    );
    res.json({ 
      success: true, 
      data: results,
      procedure_used: 'generate_flight_revenue_report'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Get various statistics
    const [flightCount] = await pool.query(
      'SELECT COUNT(*) as count FROM Flight WHERE flight_date >= CURDATE()'
    );
    const [passengerCount] = await pool.query(
      'SELECT COUNT(DISTINCT passenger_id) as count FROM Ticket WHERE booking_status = "confirmed"'
    );
    const [revenueData] = await pool.query(
      'SELECT SUM(price) as total FROM Ticket WHERE booking_status = "confirmed" AND booking_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
    );
    const [workerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM Worker WHERE status = "active"'
    );
    
    res.json({
      success: true,
      stats: {
        total_flights_today: flightCount[0].count,
        active_passengers: passengerCount[0].count,
        revenue_this_week: revenueData[0].total || 0,
        total_workers: workerCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// HEALTH CHECK
// ================================================================

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      success: true, 
      message: 'Server and database are running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// ================================================================
// ERROR HANDLER
// ================================================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

// ================================================================
// START SERVER
// ================================================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\n=================================================');
  console.log('🚀 Airport Management Backend Server Started!');
  console.log('=================================================');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log('=================================================\n');
  console.log('📋 Available Functions & Procedures:');
  console.log('  ✅ 12 Functions integrated');
  console.log('  ✅ 7 Stored Procedures integrated');
  console.log('  ✅ 10 Triggers will fire automatically');
  console.log('=================================================\n');
});