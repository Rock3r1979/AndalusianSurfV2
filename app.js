(function () {
  const SPOTS = window.SPOTS || [];
  const ApiService = window.ApiService;
  const ScoringEngine = window.ScoringEngine;
  const CFG = window.APP_CONFIG || {};
  const HOURS_TO_SHOW = CFG.HOURS_TO_SHOW || 18;

  const state = {
    aemetPayload: null,
    enriched: [],
    filters: {
      search: "",
      province: "all",
      sport: "all",
      sort: "score",
      featuredOnly: false
    }
  };

  const els = {
    refreshBtn: document.getElementById("refreshBtn"),
    searchInput: document.getElementById("searchInput"),
    provinceSelect: document.getElementById("provinceSelect"),
    sportSelect: document.getElementById("sportSelect"),
    sortSelect: document.getElementById("sortSelect"),
    featuredOnly: document.getElementById("featuredOnly"),
    statusBox: document.getElementById("statusBox"),
    lastUpdate: document.getElementById("lastUpdate"),
    rankingList: document.getElementById("rankingList"),
    cardsGrid: document.getElementById("cardsGrid"),
    statTotal: document.getElementById("statTotal"),
    statEpic: document.getElementById("statEpic"),
    statGood: document.getElementById("statGood"),
    statPoor: document.getElementById("statPoor"),
    tpl: document.getElementById("spotCardTemplate")
  };

  init();

  function init() {
    fillProvinceSelect();
    bindEvents();
    loadAll();
  }

  function fillProvinceSelect() {
    const provinces = [...new Set(SPOTS.map(s => s.province))].sort((a, b) => a.localeCompare(b, "es"));
    provinces.forEach(p => {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = p;
      els.provinceSelect.appendChild(option);
    });
  }

  function bindEvents() {
    els.refreshBtn.addEventListener("click", loadAll);

    els.searchInput.addEventListener("input", e => {
      state.filters.search = e.target.value.trim().toLowerCase();
      render();
    });

    els.provinceSelect.addEventListener("change", e => {
      state.filters.province = e.target.value;
      render();
    });

    els.sportSelect.addEventListener("change", e => {
      state.filters.sport = e.target.value;
      render();
    });

    els.sortSelect.addEventListener("change", e => {
      state.filters.sort = e.target.value;
      render();
    });

    els.featuredOnly.addEventListener("change", e => {
      state.filters.featuredOnly = e.target.checked;
      render();
    });
  }

  async function loadAll() {
    try {
      setStatus("loading", "Cargando forecasts reales...");
      state.aemetPayload = await ApiService.fetchAemetSupport();

      const results = await Promise.allSettled(
        SPOTS.map(async spot => {
          const forecast = await ApiService.fetchSpotForecast(spot, state.aemetPayload);
          const summary = ScoringEngine.summarizeSpot(spot, forecast);
          return {
            ...spot,
            forecast,
            aemet: forecast.aemet,
            ...summary
          };
        })
      );

      state.enriched = results.map((res, idx) => {
        if (res.status === "fulfilled") return res.value;
        return {
          ...SPOTS[idx],
          forecast: null,
          aemet: null,
          current: null,
          score: 0,
          scoreLabel: "Sin datos",
          scoreClass: "poor",
          analysis: ["Error al cargar este spot."],
          windowText: "Sin forecast.",
          hourlyScored: [],
          dailyScored: []
        };
      });

      setStatus("ok", "Datos actualizados");
      els.lastUpdate.textContent = `Última actualización: ${new Date().toLocaleString("es-ES")}`;
      render();
    } catch (err) {
      console.error(err);
      setStatus("error", "Error cargando datos");
      state.enriched = [];
      render();
    }
  }

  function setStatus(type, text) {
    els.statusBox.className = `status status--${type}`;
    els.statusBox.textContent = text;
  }

  function applyFilters(items) {
    const f = state.filters;

    if (f.search) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(f.search) ||
        item.province.toLowerCase().includes(f.search) ||
        item.sports.join(" ").toLowerCase().includes(f.search)
      );
    }

    if (f.province !== "all") {
      items = items.filter(item => item.province === f.province);
    }

    if (f.sport !== "all") {
      items = items.filter(item => item.sports.includes(f.sport));
    }

    if (f.featuredOnly) {
      items = items.filter(item => item.featured);
    }

    if (f.sort === "score") {
      items.sort((a, b) => b.score - a.score);
    } else if (f.sort === "name") {
      items.sort((a, b) => a.name.localeCompare(b.name, "es"));
    } else if (f.sort === "province") {
      items.sort((a, b) => a.province.localeCompare(b.province, "es"));
    }

    return items;
  }

  function render() {
    const filtered = applyFilters([...state.enriched]);
    renderStats(state.enriched);
    renderRanking([...state.enriched].sort((a, b) => b.score - a.score).slice(0, 6));
    renderCards(filtered);
  }

  function renderStats(items) {
    els.statTotal.textContent = items.length;
    els.statEpic.textContent = items.filter(i => i.score >= 78).length;
    els.statGood.textContent = items.filter(i => i.score >= 58 && i.score < 78).length;
    els.statPoor.textContent = items.filter(i => i.score < 58).length;
  }

  function renderRanking(items) {
    els.rankingList.innerHTML = "";
    items.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "ranking__item";
      div.innerHTML = `
        <span>${idx + 1}. ${item.name}</span>
        <span class="ranking__score">${item.score}</span>
      `;
      els.rankingList.appendChild(div);
    });
  }

  function renderCards(items) {
    els.cardsGrid.innerHTML = "";

    if (!items.length) {
      els.cardsGrid.innerHTML = `<div class="panel">No hay spots que coincidan con los filtros.</div>`;
      return;
    }

    const frag = document.createDocumentFragment();

    items.forEach(item => {
      const node = els.tpl.content.firstElementChild.cloneNode(true);

      node.querySelector(".js-name").textContent = item.name;
      node.querySelector(".js-meta").textContent = `${item.province} · ${item.sports.map(labelSport).join(" · ")}`;

      const badge = node.querySelector(".js-score");
      badge.textContent = `${item.score} · ${item.scoreLabel}`;
      badge.classList.add(`badge--${item.scoreClass}`);

      node.querySelector(".js-wave").textContent = item.current?.waveHeight != null ? `${item.current.waveHeight.toFixed(1)}m` : "-";
      node.querySelector(".js-period").textContent = item.current?.wavePeriod != null ? `${Math.round(item.current.wavePeriod)}s` : "-";
      node.querySelector(".js-wind").textContent = item.current?.windSpeed != null ? `${Math.round(item.current.windSpeed)}` : "-";
      node.querySelector(".js-gust").textContent = item.current?.windGust != null ? `${Math.round(item.current.windGust)}` : "-";
      node.querySelector(".js-dir").textContent = item.current?.windDirection != null ? ScoringEngine.degToCompass(item.current.windDirection) : "-";
      node.querySelector(".js-water").textContent = item.current?.seaTemp != null ? `${item.current.seaTemp.toFixed(1)}º` : "-";

      node.querySelector(".js-window").textContent = item.windowText;
      node.querySelector(".js-ideal").textContent = item.ideal;

      const analysis = node.querySelector(".js-analysis");
      item.analysis.concat(item.expert.notes).slice(0, 7).forEach(text => {
        const li = document.createElement("li");
        li.textContent = text;
        analysis.appendChild(li);
      });

      renderHoursTable(node.querySelector(".js-hours-table tbody"), item.hourlyScored.slice(0, HOURS_TO_SHOW));
      renderWindTable(node.querySelector(".js-wind-table tbody"), item.hourlyScored.slice(0, HOURS_TO_SHOW));
      renderWindSummary(node.querySelector(".js-wind-summary"), item.hourlyScored.slice(0, HOURS_TO_SHOW));
      renderDaysTable(node.querySelector(".js-days-table tbody"), item.dailyScored.slice(0, 15));
      renderWebcams(node.querySelector(".js-webcams"), item.webcams);

      const aemetWrap = node.querySelector(".js-aemet-wrap");
      const aemetText = getAemetText(item.aemet);
      if (aemetText) {
        node.querySelector(".js-aemet").textContent = aemetText;
        aemetWrap.classList.remove("hidden");
      }

      bindAccordions(node);
      frag.appendChild(node);
    });

    els.cardsGrid.appendChild(frag);
  }

  function renderHoursTable(tbody, hours) {
    tbody.innerHTML = "";
    hours.forEach(h => {
      const tr = document.createElement("tr");
      const scoreClass = h.score >= 78 ? "score-epic" : h.score >= 58 ? "score-good" : "score-poor";
      tr.innerHTML = `
        <td>${ScoringEngine.formatHour(h.time)}</td>
        <td>${h.waveHeight != null ? h.waveHeight.toFixed(1) + "m" : "-"}</td>
        <td>${h.wavePeriod != null ? Math.round(h.wavePeriod) + "s" : "-"}</td>
        <td>${h.waveDirection != null ? ScoringEngine.degToCompass(h.waveDirection) : "-"}</td>
        <td>${h.windSpeed != null ? Math.round(h.windSpeed) + " km/h" : "-"}</td>
        <td>${h.windGust != null ? Math.round(h.windGust) + " km/h" : "-"}</td>
        <td class="${scoreClass}">${h.score}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderWindTable(tbody, hours) {
    tbody.innerHTML = "";
    hours.forEach(h => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${ScoringEngine.formatHour(h.time)}</td>
        <td>${h.windDirection != null ? ScoringEngine.degToCompass(h.windDirection) : "-"}</td>
        <td>${h.windSpeed != null ? Math.round(h.windSpeed) + " km/h" : "-"}</td>
        <td>${h.windGust != null ? Math.round(h.windGust) + " km/h" : "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderWindSummary(container, hours) {
    const winds = hours.map(h => h.windSpeed).filter(v => v != null);
    const gusts = hours.map(h => h.windGust).filter(v => v != null);
    const avgWind = winds.length ? winds.reduce((a,b) => a+b, 0) / winds.length : null;
    const maxWind = winds.length ? Math.max(...winds) : null;
    const avgGust = gusts.length ? gusts.reduce((a,b) => a+b, 0) / gusts.length : null;
    const maxGust = gusts.length ? Math.max(...gusts) : null;

    container.innerHTML = `
      <div class="wind-box">
        <span class="wind-box__label">Viento medio</span>
        <span class="wind-box__value">${avgWind != null ? Math.round(avgWind) + " km/h" : "-"}</span>
      </div>
      <div class="wind-box">
        <span class="wind-box__label">Viento máx</span>
        <span class="wind-box__value">${maxWind != null ? Math.round(maxWind) + " km/h" : "-"}</span>
      </div>
      <div class="wind-box">
        <span class="wind-box__label">Racha media</span>
        <span class="wind-box__value">${avgGust != null ? Math.round(avgGust) + " km/h" : "-"}</span>
      </div>
      <div class="wind-box">
        <span class="wind-box__label">Racha máx</span>
        <span class="wind-box__value">${maxGust != null ? Math.round(maxGust) + " km/h" : "-"}</span>
      </div>
    `;
  }

  function renderDaysTable(tbody, days) {
    tbody.innerHTML = "";
    days.forEach(day => {
      const cls = day.score >= 78 ? "score-epic" : day.score >= 58 ? "score-good" : "score-poor";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${ScoringEngine.formatDay(day.date)}</td>
        <td>${day.waveHeightMax != null ? day.waveHeightMax.toFixed(1) + "m" : "-"}</td>
        <td>${day.wavePeriodMax != null ? Math.round(day.wavePeriodMax) + "s" : "-"}</td>
        <td>${day.windSpeedMax != null ? Math.round(day.windSpeedMax) + " km/h" : "-"}</td>
        <td>${day.windGustMax != null ? Math.round(day.windGustMax) + " km/h" : "-"}</td>
        <td>${day.seaTempMax != null ? day.seaTempMax.toFixed(1) + "ºC" : "-"}</td>
        <td class="${cls}">${day.score}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderWebcams(container, webcams) {
    container.innerHTML = "";
    if (!webcams?.length) {
      container.innerHTML = `<p class="muted">Sin webcam registrada.</p>`;
      return;
    }

    webcams.forEach(cam => {
      const a = document.createElement("a");
      a.href = cam.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "webcam";
      a.innerHTML = `
        <span>${cam.title}<br><small>Abrir enlace</small></span>
        <strong>↗</strong>
      `;
      container.appendChild(a);
    });
  }

  function getAemetText(aemet) {
    if (!aemet) return "";
    const nombre = aemet.nombre || "";
    const estado = aemet.estadoCielo || aemet.prediccion?.dia?.[0]?.estadoCieloDescriptivo || "";
    if (!nombre && !estado) return "";
    return `${nombre}${estado ? " · " + estado : ""}`;
  }

  function bindAccordions(card) {
    const accordions = card.querySelectorAll(".accordion");
    accordions.forEach(acc => {
      const btn = acc.querySelector(".accordion__btn");
      btn.addEventListener("click", () => {
        acc.classList.toggle("open");
      });
    });
  }

  function labelSport(s) {
    const map = {
      surf: "Surf",
      kitesurf: "Kitesurf",
      windsurf: "Windsurf",
      wingfoil: "Wingfoil",
      sup: "SUP"
    };
    return map[s] || s;
  }
})();