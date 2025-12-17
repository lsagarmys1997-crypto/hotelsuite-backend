const router = require('express').Router();
const pool = require('../db');
const { signToken } = require('../utils/jwt');

/**
 * POST /api/guest/auth
 * Body: { room_number, last_name }
 */
router.post('/auth', async (req, res) => {
  const { room_number, last_name } = req.body;

  if (!room_number || !last_name) {
    return res.status(400).json({
      error: 'Room number and last name are required'
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        g.id AS guest_id,
        g.name AS guest_name,
        r.id AS room_id,
        r.room_number,
        h.id AS hotel_id
      FROM guests g
      JOIN rooms r ON g.room_id = r.id
      JOIN hotels h ON g.hotel_id = h.id
      WHERE r.room_number = $1
        AND lower(g.name) LIKE lower($2)
        AND g.checkout_at > now()
      `,
      [room_number, `%${last_name}%`]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid room number or guest name'
      });
    }

    const guest = result.rows[0];

    const token = signToken({
      role: 'guest',
      guest_id: guest.guest_id,
      room_id: guest.room_id,
      hotel_id: guest.hotel_id
    });

    res.json({
      token,
      guest: {
        name: guest.guest_name,
        room_number: guest.room_number
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
