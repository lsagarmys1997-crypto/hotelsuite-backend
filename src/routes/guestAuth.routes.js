const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

/**
 * POST /api/guest/login
 * Guest login using room number + phone
 */
router.post('/login', async (req, res) => {
  const { room_number, phone } = req.body;

  if (!room_number || !phone) {
    return res.status(400).json({
      error: 'Room number and phone required'
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        g.id AS guest_id,
        g.name,
        g.phone,
        r.id AS room_id,
        r.room_number,
        r.hotel_id
      FROM guests g
      JOIN rooms r ON g.room_id = r.id
      WHERE r.room_number = $1
        AND g.phone = $2
      `,
      [room_number.trim(), phone.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Guest not found'
      });
    }

    const guest = result.rows[0];

    const token = jwt.sign(
      {
        guest_id: guest.guest_id,
        room_id: guest.room_id,
        hotel_id: guest.hotel_id,
        role: 'guest'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      guest: {
        name: guest.name,
        room_number: guest.room_number
      }
    });

  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({
      error: 'Guest login failed'
    });
  }
});

module.exports = router;   // 🔴 THIS LINE FIXES EVERYTHING
