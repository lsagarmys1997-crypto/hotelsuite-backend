const express = require('express');
const router = express.Router();
const pool = require('../db');
const staffAuth = require('../middleware/staffAuth');

/**
 * GET /api/staff/tickets
 * Fetch tickets for staff dashboard
 */
router.get('/', staffAuth, async (req, res) => {
  const { hotel_id, role, department, user_id } = req.staff;

  try {
    let query;
    let values;

    // ADMIN → all hotel tickets
    if (role === 'admin') {
      query = `
        SELECT
          t.*,
          r.room_number,
          g.name AS guest_name
        FROM tickets t
        JOIN rooms r ON t.room_id = r.id
        LEFT JOIN guests g ON t.guest_id = g.id
        WHERE t.hotel_id = $1
        ORDER BY t.created_at DESC
      `;
      values = [hotel_id];
    }
    // STAFF → department tickets
    else {
      query = `
        SELECT
          t.*,
          r.room_number,
          g.name AS guest_name
        FROM tickets t
        JOIN rooms r ON t.room_id = r.id
        LEFT JOIN guests g ON t.guest_id = g.id
        WHERE t.hotel_id = $1
          AND t.department = $2
        ORDER BY t.created_at DESC
      `;
      values = [hotel_id, department];
    }

    const result = await pool.query(query, values);

    res.json({
      success: true,
      tickets: result.rows
    });

  } catch (err) {
    console.error('Staff ticket fetch error:', err);
    res.status(500).json({
      error: 'Failed to fetch tickets'
    });
  }
});

module.exports = router;
