const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticate = require('../middleware/staffAuth');

/**
 * GET /api/staff/tickets
 * Admin → all tickets
 * Staff → only department tickets
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { role, department, hotel_id } = req.user;

    let query;
    let values;

    if (role === 'admin') {
      // Admin sees all tickets
      query = `
        SELECT *
        FROM tickets
        WHERE hotel_id = $1
        ORDER BY created_at DESC
      `;
      values = [hotel_id];
    } else {
      // Staff sees only department tickets
      query = `
        SELECT *
        FROM tickets
        WHERE hotel_id = $1
          AND department = $2
        ORDER BY created_at DESC
      `;
      values = [hotel_id, department];
    }

    const result = await pool.query(query, values);

    res.json({
      count: result.rows.length,
      tickets: result.rows
    });

  } catch (err) {
    console.error('Staff tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

module.exports = router;
