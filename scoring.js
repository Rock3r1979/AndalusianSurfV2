(function () {
  function degToCompass(deg) {
    if (deg == null || Number.isNaN(deg)) return "-";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
  }

  function inRange(value, min, max) {
    return value != null && value >= min && value <= max;
  }

  function dirMatches(deg, dirs) {
    return dirs.includes(degToCompass(deg));
  }

  function scoreHour(spot, hour) {
    const r = spot.expert;
    let score = 0;

    if (dirMatches(hour.waveDirection, r.waveDirections)) score += 25;
    if (inRange(hour.waveHeight, r.waveOptimal[0], r.waveOptimal[1])) score += 25;
    else if ((hour.waveHeight ?? 0) >= r.waveMin) score += 12;

    if (inRange(hour.wavePeriod, r.periodOptimal[0], r.periodOptimal[1])) score += 20;
    else if ((hour.wavePeriod ?? 0) >= r.periodMin) score += 10;

    if (dirMatches(hour.windDirection, r.windGood)) score += 20;
    else if (dirMatches(hour.windDirection, r.windBad)) score -= 10;

    if ((hour.windSpeed ?? -1) >= r.windMin && (hour.windSpeed ?? 999) <= r.windMax) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  function scoreDay(spot, day) {
    let score = 0;
    const r = spot.expert;

    if (dirMatches(day.waveDirectionDominant, r.waveDirections)) score += 25;
    if (inRange(day.waveHeightMax, r.waveOptimal[0], r.waveOptimal[1])) score += 25;
    else if ((day.waveHeightMax ?? 0) >= r.waveMin) score += 12;

    if (inRange(day.wavePeriodMax, r.periodOptimal[0], r.periodOptimal[1])) score += 20;
    else if ((day.wavePeriodMax ?? 0) >= r.periodMin) score += 10;

    if ((day.windSpeedMax ?? -1) >= r.windMin && (day.windSpeedMax ?? 999) <= r.windMax) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  function classify(score) {
    if (score >= 78) return { label: "Épico", className: "epic" };
    if (score >= 58) return { label: "Bueno", className: "good" };
    return { label: "Flojo", className: "poor" };
  }

  function formatHour(iso) {
    if (!iso) return "-";
    return new Date(iso).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function formatDay(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit"
    });
  }

  function bestWindow(spot, hourly) {
    if (!hourly?.length) return { text: "Sin forecast horario.", hours: [] };

    const next = hourly.slice(0, 24).map(h => ({
      ...h,
      score: scoreHour(spot, h)
    }));

    const good = next.filter(h => h.score >= 58);

    if (!good.length) {
      return {
        text: "No aparece una ventana buena en las próximas 24h.",
        hours: next
      };
    }

    const first = good[0];
    let last = good[0];
    for (const h of good) {
      if (new Date(h.time) >= new Date(last.time)) last = h;
    }

    return {
      text: `Mejor tramo estimado entre ${formatHour(first.time)} y ${formatHour(last.time)}.`,
      hours: next
    };
  }

  function analysis(spot, current) {
    if (!current) return ["Sin datos actuales."];

    return [
      `Ola actual ${current.waveHeight != null ? current.waveHeight.toFixed(1) + "m" : "-"}.`,
      `Periodo actual ${current.wavePeriod != null ? Math.round(current.wavePeriod) + "s" : "-"}.`,
      `Viento ${degToCompass(current.windDirection)} ${current.windSpeed != null ? Math.round(current.windSpeed) + " km/h" : "-"}.`,
      `Racha ${current.windGust != null ? Math.round(current.windGust) + " km/h" : "-"}.`,
      `Temperatura del agua ${current.seaTemp != null ? current.seaTemp.toFixed(1) + "ºC" : "-"}.`,
      `Marea orientativa: ${spot.expert.tideHint}`
    ];
  }

  function aemetText(aemet) {
    if (!aemet) return "Sin apoyo AEMET para este spot.";
    const estado = aemet.estadoCielo || aemet.prediccion?.dia?.[0]?.estadoCieloDescriptivo || "dato disponible";
    return `AEMET disponible: ${typeof estado === "string" ? estado : "dato disponible"}.`;
  }

  function summarizeSpot(spot, forecast) {
    const current = forecast?.current || null;
    const currentScore = current ? scoreHour(spot, current) : 0;
    const cls = classify(currentScore);
    const window = bestWindow(spot, forecast?.hourly || []);
    const daily = (forecast?.daily || []).map(day => ({
      ...day,
      score: scoreDay(spot, day)
    }));

    return {
      current,
      score: currentScore,
      scoreLabel: cls.label,
      scoreClass: cls.className,
      analysis: analysis(spot, current),
      windowText: window.text,
      hourlyScored: window.hours,
      dailyScored: daily
    };
  }

  window.ScoringEngine = {
    summarizeSpot,
    degToCompass,
    formatHour,
    formatDay,
    classify
  };
})();