const express = require('express');
const router = express.Router();
const pool = require('../db');
const guestAuth = require('../middleware/guestAuth');

/**
 * POST /api/guest/tickets
 * Guest creates a service request
 */
router.post('/', guestAuth, async (req, res) => {
  const { department, title, description, priority } = req.body;

  // From JWT
  const { guest_id, room_id, hotel_id } = req.guest;

  if (!department) {
    return res.status(400).json({
      error: 'department is required'
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO tickets
        (hotel_id, room_id, guest_id, department, title, description, priority)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, status, created_at
      `,
      [
        hotel_id,
        room_id,
        guest_id,
        department,
        title || null,
        description || null,
        priority || 'normal'
      ]
    );

    res.json({
      message: 'Ticket created successfully',
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to create ticket'
    });
  }
});

module.exports = router;
