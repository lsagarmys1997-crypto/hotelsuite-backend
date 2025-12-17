const express = require('express');
const router = express.Router();
const pool = require('../db');
const staffAuth = require('../middleware/staffAuth');

/**
 * =========================================
 * GET /api/staff/tickets
 * Staff ticket queue (open + in_progress)
 * =========================================
 */
router.get('/', staffAuth, async (req, res) => {
  const { hotel_id, department, role } = req.staff;

  try {
    let query = `
      SELECT
        t.id,
        t.department,
        t.priority,
        t.status,
        t.title,
        t.description,
        t.created_at,
        r.room_number,
        g.name AS guest_name
      FROM tickets t
      JOIN rooms r ON t.room_id = r.id
      LEFT JOIN guests g ON t.guest_id = g.id
      WHERE t.hotel_id = $1
        AND t.status IN ('open', 'in_progress')
    `;

    const params = [hotel_id];

    // Staff sees only their department tickets
    if (role === 'staff') {
      query += ' AND t.department = $2';
      params.push(department);
    }

    query += ' ORDER BY t.created_at ASC';

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      tickets: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to fetch tickets'
    });
  }
});

/**
 * ==================================================
 * PATCH /api/staff/tickets/:id/status
 * Staff accepts / closes ticket
 * ==================================================
 */
router.patch('/:id/status', staffAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { hotel_id, id: staff_id } = req.staff;

  const allowedStatus = ['open', 'in_progress', 'closed'];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      `
      UPDATE tickets
      SET status = $1,
          assigned_to = $2
      WHERE id = $3
        AND hotel_id = $4
      RETURNING id, status
      `,
      [status, staff_id, id, hotel_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      success: true,
      ticket: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to update ticket status'
    });
  }
});

module.exports = router;
