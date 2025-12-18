const router = require('express').Router();
const pool = require('../db');
const { signToken } = require('../utils/jwt');

/**
 * POST /api/guest/auth
 * Body: { room_number, last_name }
 */
router.post('/login', async (req, res) => {
  const { room_number, phone } = req.body;

  if (!room_number || !phone) {
    return res.status(400).json({ error: 'Room & phone required' });
  }

  try {
    const result = await pool.query(
      `
      SELECT g.id, g.name, g.phone, r.room_number, r.hotel_id
      FROM guests g
      JOIN rooms r ON r.id = g.room_id
      WHERE r.room_number = $1
        AND g.phone = $2
      `,
      [room_number, phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid details' });
    }

    const guest = result.rows[0];

    const token = jwt.sign(
      {
        guest_id: guest.id,
        hotel_id: guest.hotel_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      guest
    });

  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});
