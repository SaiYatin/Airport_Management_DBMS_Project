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

  // --- Role-check middleware helpers ---
function requireRole(role) {
  return (req, res, next) => {
    // lightweight: backend expects caller to set header 'x-user-role'
    const callerRole = (req.headers['x-user-role'] || '').toString().toLowerCase();
    if (!callerRole) {
      return res.status(401).json({ success: false, message: 'Missing caller role header' });
    }
    if (Array.isArray(role)) {
      if (!role.map(r => r.toLowerCase()).includes(callerRole)) {
        return res.status(403).json({ success: false, message: 'Forbidden: insufficient privileges' });
      }
    } else {
      if (callerRole !== role.toLowerCase()) {
        return res.status(403).json({ success: false, message: 'Forbidden: insufficient privileges' });
      }
    }
    // optionally attach callerRole to req for downstream use
    req.callerRole = callerRole;
    req.callerId = req.headers['x-user-id'] || null; // optional worker_id or passenger_id
    next();
  };
}


// ================================================================
// AUTHENTICATION ROUTES
// ================================================================
// Passenger signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, age } = req.body;

  if (!name || !email || !age) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Check if email already exists
    const [existing] = await pool.query('SELECT * FROM Passenger WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Insert passenger
    await pool.query('INSERT INTO Passenger (name, email, age) VALUES (?, ?, ?)', [name, email, age]);

    res.json({
      success: true,
      message: 'Passenger account created successfully',
      role: 'Passenger',
    });
  } catch (error) {
    console.error('❌ Signup Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login route (auto-detects Worker / Passenger)
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Check Passenger table first
    const [passenger] = await pool.query('SELECT * FROM Passenger WHERE email = ?', [email]);
    if (passenger.length > 0) {
      const p = passenger[0];
      return res.json({
        success: true,
        user: {
          passenger_id: p.passenger_id,
          name: p.name,
          email: p.email,
          age: p.age,
        },
        role: 'Passenger',
        message: 'Passenger login successful',
      });
    }

    // Then check Worker table (login by email)
    const [workerRows] = await pool.query('SELECT * FROM Worker WHERE email = ?', [email]);

    if (workerRows.length > 0) {
      const worker = workerRows[0];

      // ✅ Use the role column from database directly
      let role = 'worker';
      
      // First check if role column exists and is set
      if (worker.role) {
        role = worker.role.toLowerCase();
      } else {
        // Fallback to job-based detection if role is NULL
        const job = worker.job ? worker.job.toLowerCase() : '';
        
        if (job.includes('admin') || job.includes('administrator')) {
          role = 'admin';
        } else if (job.includes('manager') || job.includes('supervisor')) {
          role = 'manager';
        } else if (job.includes('owner')) {
          role = 'storeowner';
        } else if (job.includes('security') || job.includes('staff') || job.includes('cleaner') || job.includes('technician') || job.includes('ground')) {
          role = 'airportstaff';
        } else if (job.includes('barista') || job.includes('chef') || job.includes('cashier') || job.includes('sales') || job.includes('waiter') || job.includes('waitress')) {
          role = 'storeworker';
        }
      }

      return res.json({
        success: true,
        role,
        user: {
          worker_id: worker.worker_id,
          name: worker.name,
          email: email,
          job: worker.job,
          airport_id: worker.airport_id,
          store_id: worker.store_id,
          role,
        },
        message: `${role} login successful`,
      });
    }

    // Not found
    res.status(401).json({
      success: false,
      message: 'Invalid credentials or user not found',
    });
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// ================================================================
// FLIGHT ROUTES
// ================================================================

// Get all flights
// Get all active flights (scheduled or boarding)
// Replace the GET /api/flights endpoint in your server.js with this:

// Replace the book ticket endpoint in your server.js with this:

app.post('/api/tickets', async (req, res) => {
  const {
    passenger_name,
    passenger_email,
    passenger_phone,
    passenger_age,
    flight_number,
    seat_number,
    seat_class,
    ticket_price,
    flight_company_id,
    passenger_id // ✅ NEW: allow frontend to send logged-in passenger ID
  } = req.body;

  try {
    let passengerId = passenger_id;

    // ✅ If passenger_id not provided, look it up by email
    if (!passengerId) {
      const [existingPassenger] = await pool.query(
        'SELECT passenger_id FROM Passenger WHERE email = ?',
        [passenger_email]
      );

      if (existingPassenger.length > 0) {
        passengerId = existingPassenger[0].passenger_id;
      } else {
        // fallback: create a new passenger (rarely needed)
        const [result] = await pool.query(
          'INSERT INTO Passenger (name, email, age) VALUES (?, ?, ?)',
          [passenger_name, passenger_email, passenger_age]
        );
        passengerId = result.insertId;
      }
    }

    // ✅ Generate order number
    const orderNumber = 'TKT' + Date.now().toString().slice(-10);

    // ✅ Determine flight_company_id if missing
    let companyId = flight_company_id;
    if (!companyId) {
      const [flightData] = await pool.query(
        'SELECT flight_company_id FROM Flight WHERE flight_number = ?',
        [flight_number]
      );
      if (flightData.length > 0) companyId = flightData[0].flight_company_id;
    }

    // ✅ Book ticket using the stored procedure
    await pool.query(
      'CALL book_ticket(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        orderNumber,
        passenger_name,
        passenger_email,
        passenger_phone,
        passenger_age,
        seat_class,
        flight_number,
        companyId,
        seat_number
      ]
    );

    res.json({
      success: true,
      message: 'Ticket booked successfully',
      order_number: orderNumber,
      passenger_id: passengerId
    });
  } catch (error) {
    console.error('❌ Ticket Booking Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Also update the GET /api/flights endpoint to ensure it works correctly
app.get("/api/flights", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT flight_number,
             departure_airport,
             arrival_airport,
             flight_date,
             departure_hour,
             arrival_hour,
             available_seats,
             status,
             flight_company_id
      FROM Flight
      WHERE status IN ('scheduled', 'boarding')
      ORDER BY flight_date, departure_hour;
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Error fetching flights:", error.message);
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
    const [rows] = await pool.query('SELECT * FROM Ticket');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Cancel ticket (calls stored procedure)
app.post('/api/tickets/:order_number/cancel', async (req, res) => {
  const { reason } = req.body;
  const { order_number } = req.params;

  try {
    await pool.query('CALL cancel_ticket(?, ?)', [order_number, reason]);
    res.json({
      success: true,
      message: 'Ticket cancelled successfully',
      procedure_used: 'cancel_ticket',
      trigger_fired: 'trg_ticket_update_seats',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/tickets/price", async (req, res) => {
  try {
    const { flightNumber, seatClass } = req.query;
    const [result] = await pool.query(
      "SELECT calculate_ticket_price(?, ?) AS price",
      [flightNumber, seatClass]
    );
    res.json({ success: true, price: result[0].price });
  } catch (error) {
    console.error("Error calculating ticket price:", error.message);
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
// Get all bookings for a specific passenger by passenger_id
app.get("/api/passengers/:id/bookings", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching bookings for passenger_id: ${id}`);
    
    const [rows] = await pool.query(
      `
      SELECT t.order_number, t.flight_number, t.seat_class, t.price,
             t.booking_date, t.booking_status, t.seat_number, t.passenger_id,
             f.departure_airport, f.arrival_airport, f.flight_date
      FROM Ticket t
      JOIN Flight f ON t.flight_number = f.flight_number
      WHERE t.passenger_id = ?
      ORDER BY t.booking_date DESC
      `,
      [id]
    );
    
    console.log(`✅ Found ${rows.length} bookings for passenger ${id}`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Error fetching passenger bookings:", error.message);
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

// Get workers by manager (optional)
app.get('/api/workers/by-manager/:manager_id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM Worker WHERE supervisor_id = ? ORDER BY hire_date DESC`,
      [req.params.manager_id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// PURCHASE HISTORY ROUTE
// ================================================================

// Get purchase history for a specific passenger
app.get("/api/passengers/:id/purchase-history", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🧾 Fetching purchase history for passenger_id: ${id}`);

    const [rows] = await pool.query(
      `
      SELECT 
        p.purchase_id,
        p.order_number,
        t.flight_number,
        f.departure_airport,
        f.arrival_airport,
        f.flight_date,
        fc.flight_company_name AS company_name,
        b.booking_company_name AS booked_via,
        t.seat_class,
        t.price,
        DATE_FORMAT(p.purchase_date, '%d-%b-%Y %H:%i') AS purchased_on
      FROM Purchase p
      JOIN Ticket t ON p.order_number = t.order_number
      JOIN Flight f ON t.flight_number = f.flight_number
      LEFT JOIN FlightCompany fc ON f.flight_company_id = fc.flight_company_id
      LEFT JOIN BookingAgent b ON p.supplier_id = b.agent_id
      WHERE t.passenger_id = ?
      ORDER BY p.purchase_date DESC
      `,
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Error fetching purchase history:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
// ================================================================
// Admin-only complex nested stats (document-like)
app.get('/api/admin/complex-stats', requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.airport_id,
        a.name AS airport_name,
        COUNT(DISTINCT f.flight_number) AS total_flights,
        COALESCE(SUM(t.price), 0) AS total_revenue,
        COUNT(DISTINCT w.worker_id) AS total_workers,
        (SELECT ROUND(AVG(payment),2) FROM Worker w2 WHERE w2.airport_id = a.airport_id) AS avg_salary,
        (SELECT get_store_performance_rating(s.store_id)
           FROM Store s WHERE s.airport_id = a.airport_id
           ORDER BY s.updated_at DESC LIMIT 1) AS latest_store_rating
      FROM Airport a
      LEFT JOIN Flight f ON f.departure_airport = a.airport_id
      LEFT JOIN Ticket t ON t.flight_number = f.flight_number AND t.booking_status='confirmed'
      LEFT JOIN Worker w ON w.airport_id = a.airport_id AND w.status='active'
      GROUP BY a.airport_id, a.name
      ORDER BY total_revenue DESC
      LIMIT 50;
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/stores", async (req, res) => {
  const { store_id, name, place, store_type, product_type, airport_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO Store (store_id, name, place, store_type, product_type, airport_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [store_id, name, place, store_type, product_type, airport_id]
    );
    res.json({ success: true, message: "Store added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Add new store (Admin only)
app.post('/api/admin/stores', requireRole('Admin'), async (req, res) => {
  const { store_id, name, place, store_type, product_type, airport_id } = req.body;
  if (!store_id || !name || !place || !store_type || !airport_id) {
    return res.status(400).json({ success:false, message: 'Missing required fields' });
  }
  try {
    await pool.query(
      `INSERT INTO Store (store_id, name, place, store_type, product_type, airport_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [store_id, name, place, store_type, product_type || null, airport_id]
    );
    res.json({ success: true, message: 'Store added (admin)' });
  } catch (error) {
    res.status(500).json({ success:false, error: error.message });
  }
});

// Hire worker with role-based enforcement
// Replace the existing /api/workers/hire endpoint in your server.js with this:

// Hire worker with role-based enforcement and email support
app.post('/api/workers/hire', async (req, res) => {
  const callerRole = (req.headers['x-user-role'] || '').toString().toLowerCase();
  const callerId = req.headers['x-user-id'] || null;

  const { worker_id, name, email, age, job, payment, store_id, airport_id } = req.body;

  try {
    // Manager path
    if (callerRole === 'manager') {
      if (!store_id) return res.status(400).json({ success: false, message: 'Manager must specify store_id' });

      const [[mgrRow]] = await pool.query('SELECT airport_id FROM Worker WHERE worker_id = ?', [callerId]);
      if (!mgrRow) return res.status(403).json({ success: false, message: 'Manager identity not found' });

      const [storeRows] = await pool.query('SELECT airport_id FROM Store WHERE store_id = ?', [store_id]);
      if (storeRows.length === 0) return res.status(400).json({ success: false, message: 'Store not found' });

      const storeAirport = storeRows[0].airport_id;
      if (storeAirport !== mgrRow.airport_id) {
        return res.status(403).json({ success: false, message: 'You can only hire for stores in your airport' });
      }

      // Call stored procedure
      await pool.query('CALL hire_worker(?, ?, ?, ?, ?, ?, ?)', 
        [worker_id, name, age, job, payment, store_id, storeAirport]);
      
      // Update email separately if provided
      if (email) {
        await pool.query('UPDATE Worker SET email = ? WHERE worker_id = ?', [email, worker_id]);
      }

      return res.json({ success: true, message: 'Store worker hired by manager', procedure_used: 'hire_worker' });
    }

    // Admin path or default
    if (callerRole === 'admin' || callerRole === '') {
      // Call stored procedure
      await pool.query('CALL hire_worker(?, ?, ?, ?, ?, ?, ?)', 
        [worker_id, name, age, job, payment, store_id || null, airport_id]);
      
      // Update email separately if provided
      if (email) {
        await pool.query('UPDATE Worker SET email = ? WHERE worker_id = ?', [email, worker_id]);
      }

      return res.json({ success: true, message: 'Worker hired', procedure_used: 'hire_worker' });
    }

    return res.status(403).json({ success: false, message: 'Forbidden: only Admin or Manager can hire via this endpoint' });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================================================================
// Replace the existing POST /api/flights endpoint with this:

// Add new flight with company ID support
app.post('/api/flights', async (req, res) => {
  const { 
    flight_number, 
    departure_airport, 
    arrival_airport, 
    flight_date, 
    departure_hour, 
    arrival_hour, 
    total_seats,
    flight_company_id 
  } = req.body;
  
  try {
    // Call stored procedure (doesn't include flight_company_id)
    await pool.query(
      'CALL add_flight_schedule(?, ?, ?, ?, ?, ?, ?)',
      [flight_number, departure_airport, arrival_airport, flight_date, departure_hour, arrival_hour, total_seats]
    );
    
    // Update flight_company_id separately if provided
    if (flight_company_id) {
      await pool.query(
        'UPDATE Flight SET flight_company_id = ? WHERE flight_number = ?',
        [flight_company_id, flight_number]
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Flight added successfully',
      procedure_used: 'add_flight_schedule'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stores/:store_id/workers', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM Worker 
      WHERE store_id = ? AND status = 'active'
      ORDER BY hire_date DESC
    `, [req.params.store_id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/stores/:store_id/revenue', async (req, res) => {
  const { revenue, worker_revenue, profit_loss, notes, date } = req.body;
  const { store_id } = req.params;

  try {
    // First, create a StoreRevenue table if it doesn't exist
    // Then insert the revenue record
    await pool.query(`
      INSERT INTO StoreRevenue 
      (store_id, revenue, worker_revenue, profit_loss, notes, revenue_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [store_id, revenue, worker_revenue || 0, profit_loss || 0, notes, date]);

    res.json({ 
      success: true, 
      message: 'Revenue recorded successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stores/:store_id/revenue', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM StoreRevenue 
      WHERE store_id = ?
      ORDER BY revenue_date DESC
      LIMIT 30
    `, [req.params.store_id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/workers/:worker_id/details', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        w.*,
        s.name as store_name,
        a.name as airport_name
      FROM Worker w
      LEFT JOIN Store s ON w.store_id = s.store_id
      JOIN Airport a ON w.airport_id = a.airport_id
      WHERE w.worker_id = ?
    `, [req.params.worker_id]);

    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Worker not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/workers/:worker_id/job', requireRole('Admin'), async (req, res) => {
  const { job, payment } = req.body;
  const { worker_id } = req.params;

  try {
    await pool.query(`
      UPDATE Worker 
      SET job = ?, payment = ?, updated_at = CURRENT_TIMESTAMP
      WHERE worker_id = ?
    `, [job, payment || null, worker_id]);

    res.json({ 
      success: true, 
      message: 'Worker job updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.get('/api/airports/:airport_id/statistics', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        a.airport_id,
        a.name,
        a.city,
        COUNT(DISTINCT s.store_id) as total_stores,
        COUNT(DISTINCT w.worker_id) as total_workers,
        (SELECT COUNT(*) FROM Flight WHERE departure_airport = a.airport_id) as departing_flights,
        (SELECT COUNT(*) FROM Flight WHERE arrival_airport = a.airport_id) as arriving_flights
      FROM Airport a
      LEFT JOIN Store s ON a.airport_id = s.airport_id
      LEFT JOIN Worker w ON a.airport_id = w.airport_id AND w.status = 'active'
      WHERE a.airport_id = ?
      GROUP BY a.airport_id
    `, [req.params.airport_id]);

    if (stats.length > 0) {
      res.json({ success: true, data: stats[0] });
    } else {
      res.status(404).json({ success: false, message: 'Airport not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// Add this endpoint to your server.js

// Worker logs daily revenue
app.post('/api/workers/revenue', async (req, res) => {
  const { worker_id, store_id, revenue, revenue_date } = req.body;

  if (!worker_id || !store_id || !revenue || !revenue_date) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields' 
    });
  }

  try {
    // Insert or update worker's daily revenue contribution
    await pool.query(`
      INSERT INTO WorkerDailyRevenue (worker_id, store_id, revenue, revenue_date)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE revenue = revenue + VALUES(revenue)
    `, [worker_id, store_id, parseFloat(revenue), revenue_date]);

    res.json({ 
      success: true, 
      message: 'Revenue logged successfully' 
    });
  } catch (error) {
    console.error('Error logging worker revenue:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get worker revenue history
app.get('/api/workers/:worker_id/revenue-history', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT revenue_date, revenue, store_id
      FROM WorkerDailyRevenue
      WHERE worker_id = ?
      ORDER BY revenue_date DESC
      LIMIT 30
    `, [req.params.worker_id]);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get store's daily worker revenues (for store owner)
app.get('/api/stores/:store_id/daily-worker-revenue', async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const [rows] = await pool.query(`
      SELECT 
        wdr.worker_id,
        w.name as worker_name,
        w.job,
        wdr.revenue,
        wdr.revenue_date
      FROM WorkerDailyRevenue wdr
      JOIN Worker w ON wdr.worker_id = w.worker_id
      WHERE wdr.store_id = ? AND wdr.revenue_date = ?
      ORDER BY wdr.revenue DESC
    `, [req.params.store_id, targetDate]);

    const total = rows.reduce((sum, row) => sum + parseFloat(row.revenue || 0), 0);

    res.json({ 
      success: true, 
      data: rows,
      total_worker_revenue: total,
      date: targetDate
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Store owner updates store revenue with costs
app.post('/api/stores/:store_id/daily-revenue', async (req, res) => {
  const { store_id } = req.params;
  const { revenue_date, total_revenue, supply_cost, other_costs, notes } = req.body;

  try {
    // Get total worker revenue for that day
    const [workerRevenue] = await pool.query(`
      SELECT COALESCE(SUM(revenue), 0) as total_worker_revenue
      FROM WorkerDailyRevenue
      WHERE store_id = ? AND revenue_date = ?
    `, [store_id, revenue_date]);

    const worker_revenue = parseFloat(workerRevenue[0].total_worker_revenue || 0);
    const total_costs = parseFloat(supply_cost || 0) + parseFloat(other_costs || 0);
    const profit_loss = parseFloat(total_revenue) - worker_revenue - total_costs;

    // Insert into StoreRevenue table
    await pool.query(`
      INSERT INTO StoreRevenue 
      (store_id, revenue, worker_revenue, profit_loss, notes, revenue_date)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        revenue = VALUES(revenue),
        worker_revenue = VALUES(worker_revenue),
        profit_loss = VALUES(profit_loss),
        notes = VALUES(notes)
    `, [store_id, total_revenue, worker_revenue, profit_loss, notes, revenue_date]);

    res.json({
      success: true,
      message: 'Store revenue updated successfully',
      summary: {
        total_revenue: parseFloat(total_revenue),
        worker_revenue,
        total_costs,
        profit_loss
      }
    });
  } catch (error) {
    console.error('Error updating store revenue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});