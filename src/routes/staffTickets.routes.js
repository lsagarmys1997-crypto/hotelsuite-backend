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
      query = `
        SELECT
          t.id,
          t.status,
          t.priority,
          t.title,
          t.description,
          t.created_at,
          t.department,
          r.room_number,
          g.name AS guest_name
        FROM tickets t
        LEFT JOIN rooms r ON r.id = t.room_id
        LEFT JOIN guests g ON g.id = t.guest_id
        WHERE t.hotel_id = $1
        ORDER BY t.created_at DESC
      `;
      values = [hotel_id];
    } else {
      query = `
        SELECT
          t.id,
          t.status,
          t.priority,
          t.title,
          t.description,
          t.created_at,
          t.department,
          r.room_number,
          g.name AS guest_name
        FROM tickets t
        LEFT JOIN rooms r ON r.id = t.room_id
        LEFT JOIN guests g ON g.id = t.guest_id
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
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role, department, hotel_id } = req.user;

    const allowedStatuses = [
      'in_progress',
      'closed',
      'not_in_room',
      'guest_not_responding'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let query;
    let values;

    if (role === 'admin') {
      query = `
        UPDATE tickets
        SET status = $1
        WHERE id = $2 AND hotel_id = $3
        RETURNING id, status
      `;
      values = [status, id, hotel_id];
    } else {
      query = `
        UPDATE tickets
        SET status = $1
        WHERE id = $2
          AND hotel_id = $3
          AND department = $4
        RETURNING id, status
      `;
      values = [status, id, hotel_id, department];
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      success: true,
      ticket: result.rows[0]
    });

  } catch (err) {
    console.error('Update ticket status error:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

module.exports = router;
