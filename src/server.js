require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

/* =====================
   Global Middleware
===================== */
app.use(cors());
app.use(express.json());

/* =====================
   Route Imports
===================== */
const guestAuthRoutes = require('./routes/guestAuth.routes');
const guestTickets = require('./routes/guestTickets');
const staffAuthRoutes = require('./routes/staffAuth.routes');
const staffTicketsRoutes = require('./routes/staffTickets.routes');

/* =====================
   Health Check
===================== */
app.get('/health', (req, res) => {
  res.json({ alive: true });
});

/* =====================
   API Routes
===================== */

// Guest APIs
app.use('/api/guest', guestAuthRoutes);
app.use('/api/guest/tickets', guestTickets);

// Staff APIs
app.use('/api/staff', staffAuthRoutes);
app.use('/api/staff/tickets', staffTicketsRoutes);

/* =====================
   Root
===================== */
app.get('/', (req, res) => {
  res.json({ status: 'HotelSuite backend running' });
});

/* =====================
   Start Server
===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 HotelSuite backend running on port ${PORT}`);
});
