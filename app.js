(function () {
  const SPOTS = window.SPOTS || [];
  const ApiService = window.ApiService;
  const ScoringEngine = window.ScoringEngine;
  const MAX_HOURLY_CARDS = window.APP_CONFIG?.MAX_HOURLY_CARDS || 6;

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
      setStatus("loading", "Cargando Open-Meteo y AEMET...");
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
          topHours: []
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

  function render() {
    const filtered = applyFilters([...state.enriched]);
    renderStats(state.enriched);
    renderRanking([...state.enriched].sort((a, b) => b.score - a.score).slice(0, 5));
    renderCards(filtered);
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

  function renderStats(items) {
    els.statTotal.textContent = items.length;
    els.statEpic.textContent = items.filter(i => i.score >= 78).length;
    els.statGood.textContent = items.filter(i => i.score >= 58 && i.score < 78).length;
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
      els.cardsGrid.innerHTML = `<div class="empty">No hay spots que coincidan con los filtros.</div>`;
      return;
    }

    const frag = document.createDocumentFragment();

    items.forEach(item => {
      const node = els.tpl.content.firstElementChild.cloneNode(true);

      node.querySelector(".js-name").textContent = item.name;
      node.querySelector(".js-meta").textContent =
        `${item.province} · ${item.sports.map(labelSport).join(" · ")}`;

      const badge = node.querySelector(".js-score");
      badge.textContent = `${item.score} · ${item.scoreLabel}`;
      badge.classList.add(`badge--${item.scoreClass}`);

      node.querySelector(".js-wave").textContent =
        item.current?.waveHeight != null ? `${item.current.waveHeight.toFixed(1)}m` : "-";

      node.querySelector(".js-period").textContent =
        item.current?.wavePeriod != null ? `${Math.round(item.current.wavePeriod)}s` : "-";

      node.querySelector(".js-wind").textContent =
        item.current?.windSpeed != null ? `${Math.round(item.current.windSpeed)} km/h` : "-";

      node.querySelector(".js-dir").textContent =
        item.current?.windDirection != null ? ScoringEngine.degToCompass(item.current.windDirection) : "-";

      node.querySelector(".js-window").textContent = item.windowText;
      node.querySelector(".js-ideal").textContent = item.ideal;
      node.querySelector(".js-aemet").textContent = ScoringEngine.aemetText(item.aemet);

      const analysis = node.querySelector(".js-analysis");
      item.analysis.concat(item.expert.notes).slice(0, 6).forEach(text => {
        const li = document.createElement("li");
        li.textContent = text;
        analysis.appendChild(li);
      });

      const webcams = node.querySelector(".js-webcams");
      if (item.webcams?.length) {
        item.webcams.forEach(cam => {
          const a = document.createElement("a");
          a.href = cam.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.className = "webcam";
          a.innerHTML = `
            <span>${cam.title}<br><small>Abrir enlace</small></span>
            <strong>↗</strong>
          `;
          webcams.appendChild(a);
        });
      } else {
        webcams.innerHTML = `<p class="muted">Sin webcam registrada.</p>`;
      }

      const hours = node.querySelector(".js-hours");
      if (item.topHours?.length) {
        item.topHours.slice(0, MAX_HOURLY_CARDS).forEach(hour => {
          const chip = document.createElement("div");
          chip.className = "hour-chip";
          chip.innerHTML = `
            <span class="hour-chip__time">${ScoringEngine.formatHour(hour.time)}</span>
            <span class="hour-chip__score">${hour.score}</span>
            <span class="hour-chip__meta">${hour.waveHeight?.toFixed(1) ?? "-"}m · ${Math.round(hour.wavePeriod ?? 0)}s</span>
          `;
          hours.appendChild(chip);
        });
      } else {
        hours.innerHTML = `<p class="muted">Sin horas destacables a corto plazo.</p>`;
      }

      frag.appendChild(node);
    });

    els.cardsGrid.appendChild(frag);
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