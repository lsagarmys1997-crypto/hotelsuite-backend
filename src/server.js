const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`HotelSuite API running on port ${PORT}`);
  // Health check (VERY IMPORTANT)
app.get('/health', (req, res) => {
  res.json({ alive: true });
});
