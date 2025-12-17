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
        SELECT
          t.id,
          r.room_number,
          g.name AS guest_name,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.department,
          t.created_at
        FROM tickets t
        LEFT JOIN rooms r ON t.room_id = r.id
        LEFT JOIN guests g ON t.guest_id = g.id
        WHERE t.hotel_id = $1
        ORDER BY t.created_at DESC
      `;
      values = [hotel_id];
    } else {
      // Staff sees only their department tickets
      query = `
        SELECT
          t.id,
          r.room_number,
          g.name AS guest_name,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.department,
          t.created_at
        FROM tickets t
        LEFT JOIN rooms r ON t.room_id = r.id
        LEFT JOIN guests g ON t.guest_id = g.id
        WHERE t.hotel_id = $1
          AND t.department = $2
        ORDER BY t.created_at DESC
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
