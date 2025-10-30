# Airport Management System - API Integration Guide

## Base URL Configuration
The frontend is configured to connect to your MySQL backend at:
```
http://localhost:3001/api
```

This is set in `src/services/api.ts`. Change this URL if your backend runs on a different port.

---

## Authentication
- Uses mock authentication via localStorage
- Token sent in Authorization header: `Bearer ${user.email}`
- See `src/services/api.ts` for interceptor configuration

---

## Required API Endpoints

### 1. Flights Management

#### GET `/api/flights`
Get all flights with optional filters
- **Query Params**: `date`, `airport`, `status`, `company`
- **Response**: Array of flight objects
```json
[
  {
    "flight_number": "AI101",
    "departure_airport_id": "BLR",
    "arrival_airport_id": "DEL",
    "departure_date": "2024-10-28",
    "departure_time": "10:30",
    "arrival_time": "13:00",
    "total_seats": 180,
    "available_seats": 45,
    "status": "scheduled",
    "company": "Air India"
  }
]
```

#### GET `/api/flights/:flightNumber`
Get single flight details
- **Response**: Flight object

#### POST `/api/flights`
Add new flight (calls `add_flight_schedule` procedure)
- **Body**:
```json
{
  "flight_number": "AI101",
  "departure_airport_id": "BLR",
  "arrival_airport_id": "DEL",
  "departure_date": "2024-10-28",
  "departure_time": "10:30",
  "arrival_time": "13:00",
  "total_seats": 180
}
```

#### PATCH `/api/flights/:flightNumber/status`
Update flight status (calls `update_flight_status` procedure)
- **Body**: `{ "status": "boarding" }`

#### GET `/api/flights/:flightNumber/occupancy`
Get flight occupancy percentage (calls `get_flight_occupancy` function)
- **Response**: `{ "occupancy": 75.5 }`

#### GET `/api/flights/:flightNumber/tickets-sold`
Get tickets sold count (calls `get_tickets_sold` function)
- **Response**: `{ "tickets_sold": 135 }`

#### GET `/api/flights/:flightNumber/available-seats`
Get available seats (calls `get_available_seats` function)
- **Response**: `{ "available_seats": 45 }`

#### GET `/api/flights/:flightNumber/price`
Calculate dynamic ticket price (calls `calculate_dynamic_ticket_price` function)
- **Query Params**: `seatClass` (Economy/Business/First)
- **Response**: `{ "price": 5500, "base_price": 5000, "adjustment": 500 }`

#### GET `/api/flights/:flightNumber/distance`
Get flight distance (calls `get_flight_distance_km` function)
- **Response**: `{ "distance_km": 1800 }`

#### GET `/api/flights/company/:companyName/revenue`
Get company revenue (calls `get_company_revenue` function)
- **Response**: `{ "total_revenue": 1250000 }`

---

### 2. Ticket Management

#### GET `/api/tickets`
Get all tickets with optional filters
- **Query Params**: `passenger`, `flight`, `dateFrom`, `dateTo`, `status`, `seatClass`
- **Response**: Array of ticket objects
```json
[
  {
    "order_number": "TKT_12345",
    "passenger_id": 1,
    "passenger_name": "John Doe",
    "passenger_email": "john@example.com",
    "flight_number": "AI101",
    "seat_number": "12A",
    "seat_class": "Economy",
    "ticket_price": 5500,
    "booking_status": "Confirmed",
    "booking_date": "2024-10-27"
  }
]
```

#### GET `/api/tickets/:orderNumber`
Get ticket by order number

#### POST `/api/tickets/book`
Book a ticket (calls `book_ticket` procedure)
- **Body**:
```json
{
  "passenger_id": 1,
  "passenger_name": "John Doe",
  "passenger_email": "john@example.com",
  "passenger_phone": "9876543210",
  "passenger_age": 30,
  "flight_number": "AI101",
  "seat_number": "12A",
  "seat_class": "Economy",
  "ticket_price": 5500
}
```
- **Response**: `{ "order_number": "TKT_12345", "message": "Ticket booked successfully" }`

#### POST `/api/tickets/cancel`
Cancel a ticket (calls `cancel_ticket` procedure)
- **Body**:
```json
{
  "order_number": "TKT_12345",
  "cancellation_reason": "Change of plans"
}
```
- **Response**: `{ "refund_amount": 4400, "message": "Ticket cancelled, 80% refund processed" }`

---

### 3. Passenger Management

#### GET `/api/passengers`
Get all passengers
- **Query Params**: `search` (search by name/email)

#### GET `/api/passengers/:passengerId`
Get passenger details

#### GET `/api/passengers/search`
Search passenger by email
- **Query Params**: `email`

#### GET `/api/passengers/:passengerId/loyalty-tier`
Get passenger loyalty tier (calls `get_passenger_loyalty_tier` function)
- **Response**:
```json
{
  "tier": "Gold",
  "total_bookings": 15,
  "total_spent": 125000
}
```

---

### 4. Worker Management

#### GET `/api/workers`
Get all workers with optional filters
- **Query Params**: `airport`, `store`, `job`, `status`
- **Response**: Array of worker objects

#### GET `/api/workers/:workerId`
Get worker details

#### POST `/api/workers`
Hire new worker (calls `hire_worker` procedure)
- **Body**:
```json
{
  "worker_id": "W001",
  "worker_name": "Jane Smith",
  "age": 28,
  "job": "Security Officer",
  "payment": 35000,
  "store_id": 1,
  "airport_id": "BLR"
}
```

#### GET `/api/workers/:workerId/promotion-eligibility`
Check promotion eligibility (calls `is_eligible_for_promotion` function)
- **Response**: `{ "eligible": true, "months_employed": 18, "current_payment": 35000 }`

#### GET `/api/workers/:workerId/earnings`
Calculate worker earnings (calls `calculate_worker_earnings` function)
- **Query Params**: `months`, `bonusPercentage`
- **Response**: `{ "base_salary": 420000, "bonus": 42000, "total": 462000 }`

#### GET `/api/workers/promotion-eligible`
Get all promotion eligible workers

---

### 5. Airport Management

#### GET `/api/airports`
Get all airports
- **Response**:
```json
[
  {
    "airport_id": "BLR",
    "airport_name": "Kempegowda International Airport",
    "city": "Bangalore",
    "country": "India"
  }
]
```

#### GET `/api/airports/:airportId`
Get airport details

#### GET `/api/airports/:airportId/workers/count`
Count airport workers (calls `count_airport_workers` function)
- **Response**: `{ "worker_count": 156 }`

#### GET `/api/airports/:airportId/stats`
Get airport statistics
- **Response**:
```json
{
  "total_workers": 156,
  "total_stores": 5,
  "daily_flights": 42,
  "weekly_flights": 294
}
```

---

### 6. Store Management

#### GET `/api/stores`
Get all stores with optional filters
- **Query Params**: `airport`, `storeType`, `performanceRating`

#### GET `/api/stores/:storeId`
Get store details

#### GET `/api/stores/:storeId/performance-rating`
Get store performance rating (calls `get_store_performance_rating` function)
- **Response**:
```json
{
  "rating": "Excellent",
  "employee_count": 12,
  "total_payroll": 420000
}
```

#### GET `/api/stores/:storeId/employees`
Get store employees

---

### 7. Reports & Analytics

#### POST `/api/reports/payroll`
Generate payroll report (calls `generate_payroll_report` procedure)
- **Body**:
```json
{
  "airportId": "BLR",
  "dateFrom": "2024-10-01",
  "dateTo": "2024-10-31"
}
```
- **Response**:
```json
{
  "total_workers": 156,
  "total_payroll": 5460000,
  "average_payment": 35000,
  "workers": [...]
}
```

#### POST `/api/reports/flight-revenue`
Generate flight revenue report (calls `generate_flight_revenue_report` procedure)
- **Body**:
```json
{
  "dateFrom": "2024-10-01",
  "dateTo": "2024-10-31"
}
```
- **Response**:
```json
{
  "total_flights": 420,
  "tickets_sold": 8500,
  "total_revenue": 42500000,
  "average_price": 5000
}
```

#### GET `/api/reports/dashboard-stats`
Get dashboard statistics based on user role
- **Query Params**: `role` (Admin/Manager/Staff)
- **Response**:
```json
{
  "totalFlights": 42,
  "activePassengers": 2847,
  "weeklyRevenue": 1245000,
  "totalWorkers": 156
}
```

---

## Database Functions & Procedures to Implement

### Stored Procedures
1. **add_flight_schedule** - Add new flight to schedule
2. **update_flight_status** - Update flight status
3. **book_ticket** - Book a ticket (handles passenger creation, ticket creation, seat update)
4. **cancel_ticket** - Cancel ticket (80% refund, logs cancellation)
5. **hire_worker** - Hire new worker with validations
6. **generate_payroll_report** - Generate payroll report for airport/date range
7. **generate_flight_revenue_report** - Generate revenue report for date range

### Functions
1. **get_flight_occupancy** - Calculate flight occupancy percentage
2. **get_tickets_sold** - Count tickets sold for a flight
3. **get_available_seats** - Get available seats for a flight
4. **calculate_dynamic_ticket_price** - Calculate dynamic price based on occupancy
5. **get_flight_distance_km** - Calculate/get flight distance
6. **get_company_revenue** - Get total revenue for a flight company
7. **get_passenger_loyalty_tier** - Determine passenger loyalty tier
8. **is_eligible_for_promotion** - Check if worker is eligible for promotion
9. **calculate_worker_earnings** - Calculate worker earnings with bonus
10. **count_airport_workers** - Count active workers at airport
11. **get_store_performance_rating** - Calculate store performance rating

---

## Error Handling

The frontend expects errors in this format:
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## Testing

1. Start your backend server on `http://localhost:3001`
2. The frontend will automatically connect and make API calls
3. Check browser console for API errors
4. Use fallback mock data if backend is unavailable (automatic in Dashboard/Flights)

---

## CORS Configuration

Your Express backend needs CORS enabled:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
```

---

## Next Steps

1. Implement all endpoints in your Express.js backend
2. Create MySQL stored procedures and functions
3. Test each endpoint with the frontend
4. Verify data flow and error handling
5. Add validation and security measures

Good luck with your DBMS project! 🚀
