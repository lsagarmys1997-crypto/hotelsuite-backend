const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 MUST MATCH THIS EXACT STRUCTURE
    req.guest = {
      guest_id: decoded.guest_id,
      room_id: decoded.room_id,
      hotel_id: decoded.hotel_id
    };

    next();
  } catch (err) {
    console.error('Guest auth error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
