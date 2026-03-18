const express = require('express');
const fetch = require('node-fetch');
const { db } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function formatItem(item) {
  return {
    temp: Math.round(item.main.temp),
    feels_like: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    main: item.weather[0]?.main || '',
    description: item.weather[0]?.description || '',
    icon: item.weather[0]?.icon || '',
  };
}

// GET /api/weather?lat=&lng=&date=&units=metric
router.get('/', authenticate, async (req, res) => {
  const { lat, lng, date, units = 'metric' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Breiten- und Längengrad sind erforderlich' });
  }

  const user = db.prepare('SELECT openweather_api_key FROM users WHERE id = ?').get(req.user.id);
  if (!user || !user.openweather_api_key) {
    return res.status(400).json({ error: 'Kein API-Schlüssel konfiguriert' });
  }

  const key = user.openweather_api_key;

  try {
    // If a date is requested, try the 5-day forecast first
    if (date) {
      const targetDate = new Date(date);
      const now = new Date();
      const diffDays = (targetDate - now) / (1000 * 60 * 60 * 24);

      // Within 5-day forecast window
      if (diffDays >= -1 && diffDays <= 5) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${key}&units=${units}&lang=de`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          return res.status(response.status).json({ error: data.message || 'OpenWeatherMap API Fehler' });
        }

        const filtered = (data.list || []).filter(item => {
          const itemDate = new Date(item.dt * 1000);
          return itemDate.toDateString() === targetDate.toDateString();
        });

        if (filtered.length > 0) {
          const midday = filtered.find(item => {
            const hour = new Date(item.dt * 1000).getHours();
            return hour >= 11 && hour <= 14;
          }) || filtered[0];
          return res.json(formatItem(midday));
        }
      }

      // Outside forecast window — no data available
      return res.json({ error: 'no_forecast' });
    }

    // No date — return current weather
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}&units=${units}&lang=de`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'OpenWeatherMap API Fehler' });
    }

    res.json(formatItem(data));
  } catch (err) {
    console.error('Weather error:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Wetterdaten' });
  }
});

module.exports = router;
