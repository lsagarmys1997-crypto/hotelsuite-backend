const express = require('express');
const router = express.Router();
const pool = require('../db');
const staffAuth = require('../middleware/staffAuth');

/**
 * GET /api/staff/tickets
 * Staff fetch tickets (role aware)
 */
router.get('/', staffAuth, async (req, res) => {
  const { hotel_id, role, department } = req.staff;

  try {
    let query = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.department,
        t.status,
        t.priority,
        t.created_at,
        r.room_number,
        g.name AS guest_name
      FROM tickets t
      JOIN rooms r ON t.room_id = r.id
      JOIN guests g ON t.guest_id = g.id
      WHERE t.hotel_id = $1
    `;

    const params = [hotel_id];

    // 👇 Non-admin staff only see their department
    if (role !== 'admin') {
      query += ` AND t.department = $2`;
      params.push(department);
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      tickets: result.rows
    });
  } catch (err) {
    console.error('Staff tickets fetch error:', err);
    res.status(500).json({ error: 'Failed to load tickets' });
  }
});

module.exports = router;
