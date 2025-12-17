const guestAuthRoutes = require('./routes/guestAuth.routes');
const ticketRoutes = require('./routes/ticket.routes');

app.use('/api/guest', guestAuthRoutes);
app.use('/api/tickets', ticketRoutes);
