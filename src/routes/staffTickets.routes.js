const express = require('express');
const router = express.Router();
const pool = require('../db');
const staffAuth = require('../middleware/staffAuth');

/**
 * GET /api/staff/tickets
 * Admin → all tickets
 * Staff → department tickets
 */
router.get('/', staffAuth, async (req, res) => {
  const { role, department, hotel_id } = req.user;

  try {
    let query;
    let values;

    if (role === 'admin') {
      query = `
        SELECT t.*, r.room_number, g.name AS guest_name
        FROM tickets t
        LEFT JOIN rooms r ON t.room_id = r.id
        LEFT JOIN guests g ON t.guest_id = g.id
        WHERE t.hotel_id = $1
        ORDER BY t.created_at DESC
      `;
      values = [hotel_id];
    } else {
      query = `
        SELECT t.*, r.room_number, g.name AS guest_name
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

/**
 * PATCH /api/staff/tickets/:id/status
 * Update ticket status
 */
router.patch('/:id/status', staffAuth, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  try {
    const result = await pool.query(
      `
      UPDATE tickets
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    res.json({
      success: true,
      ticket: result.rows[0]
    });

  } catch (err) {
    console.error('Update ticket error:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

module.exports = router;
