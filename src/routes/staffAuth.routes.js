const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/staff/login
 * Staff login (PRODUCTION)
 */
console.log("DB URL:", process.env.DATABASE_URL);
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password required'
    });
  }

  try {
    // 2️⃣ Fetch user
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
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // 3️⃣ Validate password hash
    if (!user.password || !user.password.startsWith('$2')) {
      console.error('Invalid password hash for user:', user.email);
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password.trim()
    );

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // 5️⃣ Create JWT
    const token = jwt.sign(
      {
        user_id: user.id,
        hotel_id: user.hotel_id,
        role: user.role,
        department: user.department
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '12h' // hardcoded = safest
      }
    );

    // 6️⃣ Success response
    return res.json({
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
    return res.status(500).json({
      error: 'Login failed'
    });
  }
});

module.exports = router;
