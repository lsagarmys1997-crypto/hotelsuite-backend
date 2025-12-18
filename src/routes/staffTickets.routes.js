const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticate = require('../middleware/staffAuth');

router.get('/', authenticate, async (req, res) => {
  try {
    const { role, department, hotel_id } = req.user;

    let query;
    let values;

    if (role === 'admin') {
      query = `
        SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          r.room_number,
          g.name AS guest_name
        FROM tickets t
        LEFT JOIN rooms r ON t.room_id = r.id
        LEFT JOIN guests g ON t.guest_id = g.id
        WHERE t.hotel_id = $1
        ORDER BY t.created_at DESC
      `;
      values = [hotel_id];
    } else {
      query = `
        SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          r.room_number,
          g.name AS guest_name
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

    res.json({ tickets: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

module.exports = router;
