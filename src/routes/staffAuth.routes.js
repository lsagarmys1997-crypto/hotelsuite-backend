const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/staff/login
 * Staff login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password required'
    });
  }

  try {
    // Fetch user
    const result = await pool.query(
      `
      SELECT
        id,
        hotel_id,
        name,
        email,
        password,
        role,
        department
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // 🔑 IMPORTANT: trim() fixes hidden whitespace from DB
    const passwordHash = user.password.trim();

    // Compare password
    const isMatch = await bcrypt.compare(password, passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        user_id: user.id,
        hotel_id: user.hotel_id,
        role: user.role,
        department: user.department
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '12h'
      }
    );

    // Success
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        hotel_id: user.hotel_id
      }
    });

  } catch (err) {
    console.error('Staff login error:', err);
    res.status(500).json({
      error: 'Login failed'
    });
  }
});

module.exports = router;
