require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

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
 * STEP 1: Supabase DB test
 */
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      db: 'connected',
      time: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      db: 'error',
      message: error.message
    });
  }
});

module.exports = app;
