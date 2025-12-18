require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const guestAuthRoutes = require('./routes/guestAuth.routes');
const guestTicketsRoutes = require('./routes/guestTickets');
const staffAuthRoutes = require('./routes/staffAuth.routes');
const staffTicketsRoutes = require('./routes/staffTickets.routes');

// 🔥 HARD DEBUG (DO NOT SKIP)
console.log('guestAuthRoutes:', guestAuthRoutes);
console.log('guestTicketsRoutes:', guestTicketsRoutes);
console.log('staffAuthRoutes:', staffAuthRoutes);
console.log('staffTicketsRoutes:', staffTicketsRoutes);

process.exit(1); // ⛔ STOP APP HERE
