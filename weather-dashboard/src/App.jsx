import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://api.openweathermap.org'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY ?? ''

function formatDate(ts) {
  const d = new Date(ts * 1000)
  return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

async function fetchCurrentByCity(city) {
  const url = `${API_BASE}/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('City not found or API error')
  return res.json()
}

async function fetchForecastByCity(city) {
  const url = `${API_BASE}/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Forecast API error')
  return res.json()
}

async function fetchCurrentByCoords(lat, lon) {
  const url = `${API_BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Location API error')
  return res.json()
}

async function fetchForecastByCoords(lat, lon) {
  const url = `${API_BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Forecast API error')
  return res.json()
}

function CurrentCard({ data }) {
  if (!data) return null
  const icon = data.weather?.[0]?.icon
  return (
    <div className="card">
      <div className="row">
        <div>
          <div className="title">
            {data.name}{data.sys?.country ? `, ${data.sys.country}` : ''}
          </div>
          <div className="desc">{data.weather?.[0]?.description}</div>
        </div>
        <div className="temp">
          <div className="big">{Math.round(data.main.temp)}°C</div>
          <div>Feels: {Math.round(data.main.feels_like)}°C</div>
          <div>Humidity: {data.main.humidity}%</div>
          <div>Wind: {data.wind.speed} m/s</div>
        </div>
        {icon && <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt="icon" />}
      </div>
    </div>
  )
}

function ForecastList({ forecast }) {
  if (!forecast || !forecast.list) return null
  const days = []
  for (let i = 0; i < forecast.list.length; i += 8) {
    days.push(forecast.list[i])
  }
  return (
    <div className="forecast">
      {days.slice(0, 5).map((item) => (
        <div className="forecast-item" key={item.dt}>
          <div>{formatDate(item.dt)}</div>
          <div>{item.weather?.[0]?.main}</div>
          <div className="forecast-temp">{Math.round(item.main.temp)}°C</div>
          <img src={`https://openweathermap.org/img/wn/${item.weather?.[0]?.icon}.png`} alt="" />
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [city, setCity] = useState('London')
  const [current, setCurrent] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadByCity(c) {
    setError(''); setLoading(true)
    try {
      const cur = await fetchCurrentByCity(c)
      const f = await fetchForecastByCity(c)
      setCurrent(cur); setForecast(f)
    } catch (e) {
      setError(e.message)
      setCurrent(null); setForecast(null)
    } finally { setLoading(false) }
  }

  async function useGeo() {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return }
    setError(''); setLoading(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const cur = await fetchCurrentByCoords(latitude, longitude)
        const f = await fetchForecastByCoords(latitude, longitude)
        setCurrent(cur); setForecast(f)
      } catch (e) {
        setError(e.message)
        setCurrent(null); setForecast(null)
      } finally { setLoading(false) }
    }, (err) => { setError(err.message); setLoading(false) })
  }

  return (
    <div className="container">
      <h1>Weather Dashboard</h1>
      <div className="controls">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City name" />
        <button onClick={() => loadByCity(city)} disabled={loading}>Search</button>
        <button onClick={useGeo} disabled={loading}>Use My Location</button>
      </div>
      {loading && <div className="info">Loading…</div>}
      {error && <div className="error">Error: {error}</div>}
      <CurrentCard data={current} />
      <ForecastList forecast={forecast} />
    </div>
  )
}
