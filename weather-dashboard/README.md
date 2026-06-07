# Weather Dashboard (React + Vite)

This project is a small weather dashboard that uses OpenWeatherMap.

Quick start (frontend-only)
1. Copy or clone this folder.
2. Create weather-dashboard/.env with:
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key
3. cd weather-dashboard
4. npm install
5. npm run dev
6. Open http://localhost:5173

Recommended: run the included proxy to hide the API key on the server.
Server quick start:
1. create weather-dashboard/server/.env with:
   OPENWEATHER_API_KEY=your_openweather_api_key
2. from weather-dashboard run: node server/index.js
3. set in weather-dashboard/.env: VITE_API_BASE=/api
4. run frontend (npm run dev) and the app will call /api/* which the proxy serves.

Notes:
- The project uses OpenWeatherMap free APIs (current weather + 5-day forecast).
- Consider adding caching on the server to avoid rate limits and reduce latency.

License: MIT
