const express = require('express');
const router = express.Router();
const pool = require('../db');
const { signToken } = require('../utils/jwt');

/**
 * POST /api/staff/auth
 * Body: { email, password }
 */
router.post('/auth', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        hotel_id,
        name,
        email,
        role,
        department,
        password
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // MVP: plain text password check
    if (user.password !== password) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const token = signToken({
      user_id: user.id,
      hotel_id: user.hotel_id,
      role: user.role,
      department: user.department
    });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Login failed'
    });
  }
});

module.exports = router;
