(function () {
  const CFG = window.APP_CONFIG || {};
  const AEMET_API_KEY = CFG.AEMET_API_KEY || "";
  const REQUEST_TIMEOUT_MS = CFG.REQUEST_TIMEOUT_MS || 15000;
  const USE_AEMET = CFG.USE_AEMET !== false;

  async function fetchJson(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function buildMarineUrl(lat, lon) {
    const url = new URL("https://marine-api.open-meteo.com/v1/marine");
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);
    url.searchParams.set("hourly", "wave_height,wave_direction,wave_period,sea_surface_temperature");
    url.searchParams.set("forecast_days", "3");
    url.searchParams.set("timezone", "Europe/Madrid");
    return url.toString();
  }

  function buildWeatherUrl(lat, lon) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);
    url.searchParams.set("hourly", "temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m");
    url.searchParams.set("forecast_days", "3");
    url.searchParams.set("timezone", "Europe/Madrid");
    return url.toString();
  }

  function mergeHourly(marine, weather) {
    const m = marine.hourly || {};
    const w = weather.hourly || {};
    const len = Math.min(m.time?.length || 0, w.time?.length || 0);
    const rows = [];

    for (let i = 0; i < len; i++) {
      rows.push({
        time: m.time?.[i] ?? null,
        waveHeight: m.wave_height?.[i] ?? null,
        waveDirection: m.wave_direction?.[i] ?? null,
        wavePeriod: m.wave_period?.[i] ?? null,
        seaTemp: m.sea_surface_temperature?.[i] ?? null,
        airTemp: w.temperature_2m?.[i] ?? null,
        windSpeed: w.wind_speed_10m?.[i] ?? null,
        windDirection: w.wind_direction_10m?.[i] ?? null,
        windGust: w.wind_gusts_10m?.[i] ?? null
      });
    }

    return rows;
  }

  async function fetchAemetSupport() {
    if (!USE_AEMET || !AEMET_API_KEY) return null;

    try {
      const endpoint = `https://opendata.aemet.es/opendata/api/prediccion/especifica/playa?api_key=${encodeURIComponent(AEMET_API_KEY)}`;
      const meta = await fetchJson(endpoint);
      if (!meta?.datos) return null;
      const payload = await fetchJson(meta.datos);
      return payload;
    } catch (err) {
      console.warn("AEMET no disponible:", err);
      return null;
    }
  }

  function findAemetMatch(aemetPayload, spotName, province) {
    if (!Array.isArray(aemetPayload)) return null;
    const normSpot = normalize(spotName);
    const normProv = normalize(province);

    let best = null;

    for (const item of aemetPayload) {
      const name = normalize(item.nombre || "");
      const prov = normalize(item.provincia || "");
      if (name.includes(normSpot) || normSpot.includes(name) || prov.includes(normProv)) {
        best = item;
        if (name.includes(normSpot)) break;
      }
    }

    return best;
  }

  function normalize(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  }

  async function fetchSpotForecast(spot, aemetPayload) {
    const [marine, weather] = await Promise.all([
      fetchJson(buildMarineUrl(spot.lat, spot.lon)),
      fetchJson(buildWeatherUrl(spot.lat, spot.lon))
    ]);

    const hourly = mergeHourly(marine, weather);
    const aemet = findAemetMatch(aemetPayload, spot.name, spot.province);

    return {
      current: hourly[0] || null,
      hourly,
      aemet
    };
  }

  window.ApiService = {
    fetchAemetSupport,
    fetchSpotForecast
  };
})();