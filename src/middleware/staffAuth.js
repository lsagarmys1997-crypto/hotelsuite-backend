const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔑 THIS IS THE MOST IMPORTANT LINE
    req.user = decoded;

    next();
  } catch (err) {
    console.error('JWT error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
