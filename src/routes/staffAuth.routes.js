const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * TEMPORARY: Reset staff password
 * REMOVE THIS ROUTE AFTER SUCCESS
 * POST /api/staff/reset-password
 */
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({
      error: 'Email and newPassword required'
    });
  }

  try {
    // Generate bcrypt hash INSIDE backend
    const hash = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      `
      UPDATE users
      SET password = $1
      WHERE email = $2
      RETURNING email
      `,
      [hash, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({
      error: 'Password reset failed'
    });
  }
});

/**
 * POST /api/staff/login
 * Staff login (PRODUCTION)
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password required'
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

    // Important: trim() fixes hidden whitespace issues
    const passwordHash = user.password.trim();

    const isMatch = await bcrypt.compare(password, passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

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
