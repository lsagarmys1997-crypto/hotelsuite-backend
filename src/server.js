require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes (IMPORTANT: these must export router directly)
const guestAuthRoutes = require('./routes/guestAuth.routes');
const guestTicketsRoutes = require('./routes/guestTickets');
const staffAuthRoutes = require('./routes/staffAuth.routes');
const staffTicketsRoutes = require('./routes/staffTickets.routes');

// Health check
app.get('/health', (req, res) => {
  res.json({ alive: true });
});

// Routes
app.use('/api/guest', guestAuthRoutes);
app.use('/api/guest/tickets', guestTicketsRoutes);

app.use('/api/staff', staffAuthRoutes);
app.use('/api/staff/tickets', staffTicketsRoutes);

// Root
app.get('/', (req, res) => {
  res.json({ status: 'HotelSuite backend running' });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 HotelSuite backend running on port ${PORT}`);
});
