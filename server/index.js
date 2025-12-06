const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bookingsRouter = require('./routes/bookings');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://admin:password@localhost:27017/vaiu_voice_agent?authSource=admin";

console.log("Connecting to MongoDB using URI:", MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ Mongo connection error', err));

app.use('/api/bookings', bookingsRouter);

app.get('/', (req, res) => {
  res.send('Voice Agent API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
