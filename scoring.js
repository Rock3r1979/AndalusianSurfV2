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
    else if (hour.waveHeight >= r.waveMin) score += 12;

    if (inRange(hour.wavePeriod, r.periodOptimal[0], r.periodOptimal[1])) score += 20;
    else if (hour.wavePeriod >= r.periodMin) score += 10;

    if (dirMatches(hour.windDirection, r.windGood)) score += 20;
    else if (dirMatches(hour.windDirection, r.windBad)) score -= 10;

    if (hour.windSpeed != null && hour.windSpeed >= r.windMin && hour.windSpeed <= r.windMax) {
      score += 10;
    }

    score = Math.max(0, Math.min(100, score));
    return score;
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

  function buildAnalysis(spot, current) {
    if (!current) return ["Sin datos actuales."];

    const out = [];
    out.push(`Ola actual ${current.waveHeight != null ? current.waveHeight.toFixed(1) + "m" : "-"}.`);
    out.push(`Periodo actual ${current.wavePeriod != null ? Math.round(current.wavePeriod) + "s" : "-"}.`);
    out.push(`Viento ${degToCompass(current.windDirection)} ${current.windSpeed != null ? Math.round(current.windSpeed) + " km/h" : "-"}.`);
    out.push(`Marea orientativa: ${spot.expert.tideHint}`);
    return out;
  }

  function computeBestWindow(spot, hourly) {
    if (!hourly?.length) return { text: "Sin forecast horario.", hours: [] };

    const scoped = hourly.slice(0, 18).map(h => ({
      ...h,
      score: scoreHour(spot, h)
    }));

    const top = scoped
      .filter(h => h.score >= 58)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    if (!top.length) {
      return {
        text: "No aparece una ventana buena en las próximas horas.",
        hours: scoped.slice(0, 6)
      };
    }

    const ordered = [...top].sort((a, b) => new Date(a.time) - new Date(b.time));
    return {
      text: `Mejor tramo estimado entre ${formatHour(ordered[0].time)} y ${formatHour(ordered[ordered.length - 1].time)}.`,
      hours: top
    };
  }

  function summarizeSpot(spot, forecast) {
    const current = forecast?.current || null;
    const hourly = forecast?.hourly || [];
    const currentScore = current ? scoreHour(spot, current) : 0;
    const klass = classify(currentScore);
    const window = computeBestWindow(spot, hourly);

    return {
      current,
      score: currentScore,
      scoreLabel: klass.label,
      scoreClass: klass.className,
      analysis: buildAnalysis(spot, current),
      windowText: window.text,
      topHours: window.hours
    };
  }

  function aemetText(aemet) {
    if (!aemet) return "Sin apoyo AEMET para este spot.";
    const estado = aemet.estadoCielo || aemet.prediccion?.dia?.[0]?.estadoCieloDescriptivo || "Dato disponible";
    const viento = aemet.viento || aemet.prediccion?.dia?.[0]?.viento || "";
    return `AEMET: ${typeof estado === "string" ? estado : "dato disponible"}${viento ? ` · viento ${JSON.stringify(viento)}` : ""}`;
  }

  window.ScoringEngine = {
    summarizeSpot,
    formatHour,
    degToCompass,
    aemetText
  };
})();