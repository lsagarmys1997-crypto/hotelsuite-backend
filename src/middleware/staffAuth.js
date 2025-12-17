const jwt = require('jsonwebtoken');

module.exports = function staffAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'staff' && decoded.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.staff = decoded; // user_id, hotel_id, role, department
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
