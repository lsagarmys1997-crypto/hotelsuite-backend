const express = require('express');
const router = express.Router();
const pool = require('../db');
const guestAuth = require('../middleware/guestAuth');

/**
 * POST /api/guest/tickets
 * Guest creates a ticket (SECURE)
 */
router.post('/', guestAuth, async (req, res) => {
  const { title, description, department, priority } = req.body;
  const { guest_id, room_id, hotel_id } = req.guest;

  if (!title || !department) {
    return res.status(400).json({
      error: 'Missing required fields'
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO tickets (
        hotel_id,
        room_id,
        guest_id,
        department,
        title,
        description,
        priority,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'open')
      RETURNING *
      `,
      [
        hotel_id,
        room_id,
        guest_id,
        department,
        title,
        description || '',
        priority || 'normal'
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

/**
 * ✅ GET /api/guest/tickets
 * Fetch tickets for logged-in guest
 */
router.get('/', guestAuth, async (req, res) => {
  const { guest_id } = req.guest;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM tickets
      WHERE guest_id = $1
      ORDER BY created_at DESC
      `,
      [guest_id]
    );

    res.json({
      tickets: result.rows
    });
  } catch (err) {
    console.error('Fetch guest tickets error:', err);
    res.status(500).json({
      error: 'Failed to fetch tickets'
    });
  }
});

module.exports = router;
