const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const DEFAULT_LOCATION = process.env.DEFAULT_LOCATION || 'Bengaluru,IN';

async function geocodeLocation(location) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
  const resp = await axios.get(url);
  if (!resp.data || resp.data.length === 0) throw new Error('Location not found');
  return { lat: resp.data[0].lat, lon: resp.data[0].lon, name: resp.data[0].name, country: resp.data[0].country };
}

function mapWeatherMainToCondition(main) {
  if (!main) return 'unknown';
  const m = main.toLowerCase();
  if (m.includes('clear')) return 'sunny';
  if (m.includes('rain') || m.includes('drizzle') || m.includes('thunderstorm')) return 'rainy';
  if (m.includes('snow')) return 'snow';
  if (m.includes('cloud')) return 'cloudy';
  return 'cloudy';
}

async function getWeatherForDate(dateInput, locationInput) {
  if (!OPENWEATHER_API_KEY) throw new Error('OPENWEATHER_API_KEY not set in env');

  const location = locationInput || DEFAULT_LOCATION;
  const { lat, lon, name, country } = await geocodeLocation(location);

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const resp = await axios.get(url);
  const list = resp.data.list;

  const target = new Date(dateInput);
  const findClosest = list.reduce((best, item) => {
    const itemDate = new Date(item.dt * 1000);
    const diff = Math.abs(itemDate - target);
    if (!best || diff < best.diff) return { item, diff };
    return best;
  }, null);

  const chosen = findClosest ? findClosest.item : list[0];
  const main = chosen && chosen.weather && chosen.weather[0] ? chosen.weather[0].main : null;
  const condition = mapWeatherMainToCondition(main);

  const suggestion = (() => {
    if (condition === 'sunny') return `Perfect weather for outdoor dining on ${target.toDateString()}.`;
    if (condition === 'rainy') return `It might rain on ${target.toDateString()}. I'd recommend indoor seating.`;
    if (condition === 'snow') return `Snow expected on ${target.toDateString()}. Indoor seating recommended.`;
    if (condition === 'cloudy') return `Weather looks cloudy on ${target.toDateString()}. Indoor seating may be more comfortable.`;
    return `Weather forecast unavailable for ${target.toDateString()}.`;
  })();

  return {
    location: { name, country, lat, lon },
    forecastTime: chosen ? new Date(chosen.dt * 1000) : null,
    temperature: chosen ? chosen.main.temp : null,
    main: main || null,
    condition,
    suggestion,
    raw: chosen || null
  };
}

module.exports = { getWeatherForDate };
