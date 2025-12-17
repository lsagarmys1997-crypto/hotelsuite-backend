require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./db');
const guestTicketsRoutes = require('./routes/guestTickets');
const guestAuthRoutes = require('./routes/guestAuth.routes');
app.use('/api/guest/tickets', guestTicketsRoutes);

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Health check
 */
app.get('/', (req, res) => {
  res.json({ status: 'HotelSuite backend running' });
});

/**
 * DB test (keep permanently)  
 */
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ db: 'connected', time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ db: 'error', message: err.message });
  }
});

/**
 * Guest auth
 */
app.use('/api/guest', guestAuthRoutes);

module.exports = app;
