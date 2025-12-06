const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const { getWeatherForDate } = require('../utils/weather');

router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      numberOfGuests,
      bookingDate,
      bookingTime,
      cuisinePreference,
      specialRequests,
      location
    } = req.body;

    if (!customerName || !numberOfGuests || !bookingDate || !bookingTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const weather = await getWeatherForDate(bookingDate, location).catch(() => null);

    let seatingPreference = 'unspecified';
    if (weather && weather.condition) {
      seatingPreference = (weather.condition === 'sunny') ? 'outdoor' : 'indoor';
    }

    const booking = new Booking({
      bookingId: uuidv4(),
      customerName,
      numberOfGuests,
      bookingDate: new Date(bookingDate),
      bookingTime,
      cuisinePreference,
      specialRequests,
      weatherInfo: weather,
      seatingPreference,
      status: 'confirmed'
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { bookingId: req.params.id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
