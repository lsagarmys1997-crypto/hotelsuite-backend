const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * POST /api/guest/tickets
 * Guest creates a ticket
 */
router.post('/', async (req, res) => {
  const {
    hotel_id,
    room_number,
    department,
    title,
    description,
    priority,
    guest_name
  } = req.body;

  // Validation
  if (!hotel_id || !room_number || !department || !title) {
    return res.status(400).json({
      error: 'Missing required fields'
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO tickets (
        hotel_id,
        room_number,
        department,
        title,
        description,
        priority,
        guest_name,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'open')
      RETURNING *
      `,
      [
        hotel_id,
        room_number,
        department,
        title,
        description || '',
        priority || 'normal',
        guest_name || 'Guest'
      ]
    );

    res.status(201).json({
      success: true,
      ticket: result.rows[0]
    });

  } catch (err) {
    console.error('Guest ticket error:', err);
    res.status(500).json({
      error: 'Failed to create ticket'
    });
  }
});

module.exports = router;
