const router = require('express').Router();
const db = require('../db');
const { signGuestToken } = require('../utils/jwt');

/**
 * POST /api/guest/auth
 * Body: { room_number, last_name }
 */
router.post('/auth', async (req, res) => {
  const { room_number, last_name } = req.body;

  if (!room_number || !last_name) {
    return res.status(400).json({ error: 'Room number and last name required' });
  }

  const result = await db.query(
    `
    select g.id as guest_id, g.name, r.id as room_id, r.room_number, h.id as hotel_id
    from guests g
    join rooms r on g.room_id = r.id
    join hotels h on g.hotel_id = h.id
    where r.room_number = $1
      and lower(g.name) like lower($2)
      and g.checkout_at > now()
    `,
    [room_number, `%${last_name}%`]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid room or guest name' });
  }

  const guest = result.rows[0];

  const token = signGuestToken({
    guest_id: guest.guest_id,
    room_id: guest.room_id,
    hotel_id: guest.hotel_id,
    role: 'guest'
  });

  res.json({
    token,
    guest: {
      name: guest.name,
      room_number: guest.room_number
    }
  });
});

module.exports = router;
