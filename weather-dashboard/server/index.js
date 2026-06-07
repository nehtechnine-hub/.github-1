// Simple proxy to hide OpenWeatherMap key (uses global fetch on Node 18+)
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000
const KEY = process.env.OPENWEATHER_API_KEY
if (!KEY) {
  console.error('Set OPENWEATHER_API_KEY in server .env')
  process.exit(1)
}

app.get('/api/weather', async (req, res) => {
  const { city, lat, lon } = req.query
  let target
  if (city) {
    target = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${KEY}`
  } else if (lat && lon) {
    target = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${KEY}`
  } else {
    return res.status(400).json({ error: 'Provide city or lat+lon' })
  }
  const r = await fetch(target)
  const body = await r.text()
  res.status(r.status).send(body)
})

app.get('/api/forecast', async (req, res) => {
  const { city, lat, lon } = req.query
  let target
  if (city) {
    target = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${KEY}`
  } else if (lat && lon) {
    target = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${KEY}`
  } else {
    return res.status(400).json({ error: 'Provide city or lat+lon' })
  }
  const r = await fetch(target)
  const body = await r.text()
  res.status(r.status).send(body)
})

app.listen(PORT, () => console.log(`Proxy server listening on http://localhost:${PORT}`))
