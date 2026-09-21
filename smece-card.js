// smece-card.js
// Self-contained Home Assistant Lovelace card for waste/bin collection countdowns.
// No Home Assistant entities or calendar required for the built-in database entries —
// schedules for known settlements ship bundled inside the card (WASTE_DB below).
// A setup wizard (country -> county/zupanija -> settlement/naselje) lets you pick
// your location once; the card remembers it in its config from then on.
// Power users can still bypass the wizard entirely with a manual "bins" or "areas"
// config (see README) if their settlement isn't in the database yet.

const WASTE_DB = {
  HR: {
    name: 'Hrvatska',
    counties: {
      'medjimurska': {
        name: 'Međimurska županija',
        settlements: {
          'krizovec': {
            name: 'Križovec / Peklenica (Murs-ekom)',
            bins: [
              {
                id: 'bio',
                label: 'Bio otpad',
                color: '#8a5a34',
                lid_color: '#6e4527',
                dates: '2026-01-09,2026-01-20,2026-02-03,2026-02-17,2026-03-03,2026-03-17,2026-03-31,2026-04-14,2026-04-28,2026-05-12,2026-05-26,2026-06-09,2026-06-23,2026-07-07,2026-07-21,2026-08-04,2026-08-18,2026-09-01,2026-09-15,2026-09-29,2026-10-13,2026-10-27,2026-11-10,2026-11-24,2026-12-08,2026-12-22',
              },
              {
                id: 'mixed',
                label: 'Miješani',
                color: '#4caf50',
                lid_color: '#3d8c40',
                dates: '2026-01-09,2026-01-20,2026-02-03,2026-02-17,2026-03-03,2026-03-17,2026-03-31,2026-04-14,2026-04-28,2026-05-12,2026-05-26,2026-06-09,2026-06-23,2026-07-07,2026-07-21,2026-08-04,2026-08-18,2026-09-01,2026-09-15,2026-09-29,2026-10-13,2026-10-27,2026-11-10,2026-11-24,2026-12-08,2026-12-22',
              },
              {
                id: 'paper',
                label: 'Papir',
                color: '#2196f3',
                lid_color: '#1976d2',
                dates: '2026-01-14,2026-02-11,2026-03-11,2026-04-08,2026-05-06,2026-06-03,2026-07-01,2026-07-29,2026-08-26,2026-09-23,2026-10-21,2026-11-13,2026-12-16',
              },
              {
                id: 'plastic',
                label: 'Plastika',
                color: '#f5d020',
                lid_color: '#d4b40f',
                dates: '2026-01-14,2026-02-11,2026-03-11,2026-04-08,2026-05-06,2026-06-03,2026-07-01,2026-07-29,2026-08-26,2026-09-23,2026-10-21,2026-11-13,2026-12-16',
              },
              {
                id: 'glass',
                label: 'Metal/Staklo',
                color: '#9e9e9e',
                lid_color: '#7d7d7d',
                dates: '2026-01-17,2026-02-14,2026-03-14,2026-04-11,2026-05-09,2026-06-06,2026-07-04,2026-08-01,2026-08-29,2026-09-26,2026-10-24,2026-11-21,2026-12-19',
              },
            ],
          },
          'dekanovec': {
            name: 'Dekanovec (PRE-KOM)',
            bins: [
              {
                id: 'bio',
                label: 'Bio otpad',
                color: '#8a5a34',
                lid_color: '#6e4527',
                dates: '2026-01-07,2026-01-21,2026-02-04,2026-02-18,2026-03-04,2026-03-18,2026-04-01,2026-04-15,2026-04-29,2026-05-13,2026-05-27,2026-06-10,2026-06-24,2026-07-08,2026-07-22,2026-08-03,2026-08-19,2026-09-02,2026-09-16,2026-09-30,2026-10-14,2026-10-28,2026-11-11,2026-11-25,2026-12-09,2026-12-23',
              },
              {
                id: 'mixed',
                label: 'Miješani',
                color: '#4a4a4a',
                lid_color: '#2e2e2e',
                dates: '2026-01-14,2026-01-28,2026-02-11,2026-02-25,2026-03-11,2026-03-25,2026-04-08,2026-04-22,2026-05-06,2026-05-20,2026-06-03,2026-06-17,2026-07-01,2026-07-15,2026-07-29,2026-08-12,2026-08-26,2026-09-09,2026-09-23,2026-10-07,2026-10-21,2026-11-04,2026-11-21,2026-12-02,2026-12-16,2026-12-30',
              },
              {
                id: 'recikl',
                label: 'Papir/Plastika/Staklo/Metal',
                color: '#4caf50',
                lid_color: '#3d8c40',
                dates: '2026-01-20,2026-02-17,2026-03-17,2026-04-21,2026-05-19,2026-06-16,2026-07-21,2026-08-18,2026-09-15,2026-10-20,2026-11-17,2026-12-15',
              },
            ],
          },
        },
      },
    },
  },
};

function dbCountries() {
  return Object.keys(WASTE_DB).map((id) => ({ id, name: WASTE_DB[id].name }));
}
function dbCounties(countryId) {
  const c = WASTE_DB[countryId];
  if (!c) return [];
  return Object.keys(c.counties).map((id) => ({ id, name: c.counties[id].name }));
}
function dbSettlements(countryId, countyId) {
  const c = WASTE_DB[countryId] && WASTE_DB[countryId].counties[countyId];
  if (!c) return [];
  return Object.keys(c.settlements).map((id) => ({ id, name: c.settlements[id].name }));
}
function dbBins(countryId, countyId, settlementId) {
  const s =
    WASTE_DB[countryId] &&
    WASTE_DB[countryId].counties[countyId] &&
    WASTE_DB[countryId].counties[countyId].settlements[settlementId];
  return s ? s.bins : null;
}

// ============================================================
// EDITOR — setup wizard (country -> county -> settlement)
// ============================================================
class SmeceCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  _configChanged(patch) {
    const newConfig = { ...this._config, ...patch };
    this._config = newConfig;
    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
    this._render();
  }

  _render() {
    const cfg = this._config;
    const usingWizard = !cfg.areas && !cfg.bins;

    if (!usingWizard) {
      this.innerHTML = `
        <div style="padding:12px;font-family:var(--paper-font-body1_-_font-family,sans-serif);font-size:.9rem;color:var(--primary-text-color)">
          Ova kartica koristi ručni "areas" ili "bins" config (napredni način).
          Uredi je izravno u YAML načinu ("Edit in YAML"). Da koristiš čarobnjak za odabir naselja,
          ukloni "areas"/"bins" iz configa i ponovno otvori ovaj uređivač.
        </div>
      `;
      return;
    }

    const country = cfg.country || '';
    const county = cfg.county || '';
    const settlement = cfg.settlement || '';

    const countries = dbCountries();
    const counties = country ? dbCounties(country) : [];
    const settlements = country && county ? dbSettlements(country, county) : [];

    const wrap = document.createElement('div');
    wrap.style.padding = '12px';
    wrap.style.fontFamily = 'var(--paper-font-body1_-_font-family, sans-serif)';

    const titleField = document.createElement('ha-textfield');
    titleField.label = 'Naslov kartice (opcionalno)';
    titleField.value = cfg.title || '';
    titleField.style.display = 'block';
    titleField.style.marginBottom = '14px';
    titleField.addEventListener('input', (e) => this._configChanged({ title: e.target.value }));
    wrap.appendChild(titleField);

    const makeSelect = (labelText, options, value, onChange) => {
      const row = document.createElement('div');
      row.style.marginBottom = '14px';
      const label = document.createElement('div');
      label.textContent = labelText;
      label.style.fontSize = '.78rem';
      label.style.marginBottom = '4px';
      label.style.color = 'var(--secondary-text-color)';
      row.appendChild(label);
      const select = document.createElement('select');
      select.style.width = '100%';
      select.style.padding = '8px';
      select.style.borderRadius = '6px';
      select.style.background = 'var(--card-background-color, #1c1c1c)';
      select.style.color = 'var(--primary-text-color)';
      select.style.border = '1px solid var(--divider-color, #444)';
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '-- odaberi --';
      select.appendChild(emptyOpt);
      options.forEach((opt) => {
        const o = document.createElement('option');
        o.value = opt.id;
        o.textContent = opt.name;
        if (opt.id === value) o.selected = true;
        select.appendChild(o);
      });
      select.addEventListener('change', (e) => onChange(e.target.value));
      row.appendChild(select);
      return row;
    };

    wrap.appendChild(
      makeSelect('Država', countries, country, (val) =>
        this._configChanged({ country: val, county: '', settlement: '' })
      )
    );

    if (country) {
      wrap.appendChild(
        makeSelect('Županija', counties, county, (val) =>
          this._configChanged({ county: val, settlement: '' })
        )
      );
    }

    if (country && county) {
      wrap.appendChild(
        makeSelect('Naselje', settlements, settlement, (val) => this._configChanged({ settlement: val }))
      );
    }

    if (country && county && settlement) {
      const ok = document.createElement('div');
      ok.style.marginTop = '8px';
      ok.style.padding = '10px';
      ok.style.borderRadius = '8px';
      ok.style.background = 'rgba(76,175,80,.15)';
      ok.style.color = '#4caf50';
      ok.style.fontSize = '.85rem';
      ok.textContent = '✓ Naselje odabrano — raspored je učitan iz ugrađene baze kartice.';
      wrap.appendChild(ok);
    } else {
      const info = document.createElement('div');
      info.style.marginTop = '8px';
      info.style.fontSize = '.8rem';
      info.style.color = 'var(--secondary-text-color)';
      info.textContent =
        'Tvoje naselje nije na popisu? Otvori README na GitHubu (dinowuk/smece-card) za upute kako ručno dodati raspored, ili zatraži da se doda u bazu.';
      wrap.appendChild(info);
    }

    this.innerHTML = '';
    this.appendChild(wrap);
  }
}
customElements.define('smece-card-editor', SmeceCardEditor);

// ============================================================
// MAIN CARD
// ============================================================
class SmeceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config) throw new Error('smece-card: config required');

    let areas = null;
    if (Array.isArray(config.areas) && config.areas.length > 0) {
      areas = config.areas;
    } else if (Array.isArray(config.bins) && config.bins.length > 0) {
      areas = [{ name: null, bins: config.bins }];
    } else if (config.country && config.county && config.settlement) {
      const bins = dbBins(config.country, config.county, config.settlement);
      if (bins) areas = [{ name: null, bins }];
    }

    this.config = config;
    this._areas = areas;

    let storedIdx = 0;
    if (areas && areas.length > 1) {
      try {
        const key = 'smece-card-selected-area-' + (config.storage_key || 'default');
        const stored = window.localStorage.getItem(key);
        if (stored !== null) storedIdx = parseInt(stored, 10) || 0;
      } catch (e) {
        /* localStorage unavailable, ignore */
      }
    }
    this._selectedAreaIndex = areas ? Math.min(storedIdx, areas.length - 1) : 0;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement('smece-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'Odvoz otpada',
      country: 'HR',
      county: 'medjimurska',
      settlement: 'krizovec',
    };
  }

  _selectArea(idx) {
    this._selectedAreaIndex = idx;
    try {
      const key = 'smece-card-selected-area-' + (this.config.storage_key || 'default');
      window.localStorage.setItem(key, String(idx));
    } catch (e) {
      /* ignore */
    }
    this._render();
  }

  _parseDates(str) {
    if (!str) return [];
    return String(str)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
  }

  _daysUntilNext(dateStrings) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const future = dateStrings.filter((d) => d >= todayStr).sort();
    if (future.length === 0) return { days: null, nextDate: null };
    const next = future[0];
    const [y, m, d] = next.split('-').map(Number);
    const nextDate = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = nextDate.getTime() - today.getTime();
    const days = Math.round(diffMs / 86400000);
    return { days, nextDate: next };
  }

  _fmtDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}.`;
  }

  _binSvg(color, lidColor, days, label) {
    const dayText = days === null ? '--' : days === 0 ? 'DANAS' : days === 1 ? 'SUTRA' : `${days} d`;
    const fontSize = days === null || days > 1 ? 22 : 15;
    return `
      <svg viewBox="0 0 100 150" class="bin-svg">
        <rect x="40" y="2" width="20" height="8" rx="3" fill="${lidColor}"/>
        <rect x="12" y="10" width="76" height="20" rx="6" fill="${lidColor}"/>
        <rect x="16" y="28" width="68" height="102" rx="10" fill="${color}"/>
        <rect x="16" y="28" width="68" height="14" rx="6" fill="rgba(255,255,255,0.18)"/>
        <circle cx="32" cy="134" r="7" fill="#2b2b2b"/>
        <circle cx="68" cy="134" r="7" fill="#2b2b2b"/>
        <text x="50" y="85" text-anchor="middle" font-size="${fontSize}" font-weight="800" fill="#ffffff" style="paint-order: stroke; stroke: rgba(0,0,0,.55); stroke-width: 3px;">${dayText}</text>
      </svg>
      <div class="bin-label">${label}</div>
    `;
  }

  _renderNotConfigured() {
    this.shadowRoot.innerHTML = `
      <style>:host{display:block} ha-card{padding:16px;text-align:center;color:var(--secondary-text-color)}</style>
      <ha-card>
        <div>⚠️ Kartica nije podešena.</div>
        <div style="margin-top:6px;font-size:.85rem">Klikni na uređivanje kartice i odaberi državu → županiju → naselje.</div>
      </ha-card>
    `;
  }

  _render() {
    if (!this._areas) {
      this._renderNotConfigured();
      return;
    }
    const cfg = this.config;
    const areas = this._areas;
    const areaIdx = this._selectedAreaIndex;
    const currentArea = areas[areaIdx];
    const bins = currentArea.bins
      .map((bin) => {
        const dates = this._parseDates(bin.dates);
        const { days, nextDate } = this._daysUntilNext(dates);
        return { ...bin, days, nextDate };
      })
      .sort((a, b) => {
        if (a.days === null && b.days === null) return 0;
        if (a.days === null) return 1;
        if (b.days === null) return -1;
        return a.days - b.days;
      });

    const style = `
      <style>
        :host { display: block; }
        ha-card { padding: 16px; }
        .title-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
        .title { font-size: 1.1rem; font-weight: 700; color: var(--primary-text-color); }
        .area-select { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); border: 1px solid var(--divider-color, #444); border-radius: 8px; padding: 4px 8px; font-size: .85rem; }
        .row { display: grid; grid-template-columns: repeat(${bins.length}, 1fr); gap: 10px; }
        .cell { text-align: center; }
        .bin-svg { width: 100%; max-width: 90px; height: auto; filter: drop-shadow(0 2px 4px rgba(0,0,0,.35)); }
        .bin-label { margin-top: 6px; font-size: .72rem; font-weight: 600; color: var(--secondary-text-color); line-height: 1.2; }
        .next-date { font-size: .62rem; color: var(--disabled-text-color, #888); margin-top: 2px; }
      </style>
    `;

    const cellsHtml = bins
      .map(
        (bin) => `
        <div class="cell">
          ${this._binSvg(bin.color, bin.lid_color || bin.color, bin.days, bin.label)}
          <div class="next-date">${this._fmtDate(bin.nextDate)}</div>
        </div>
      `
      )
      .join('');

    this.shadowRoot.innerHTML = `
      ${style}
      <ha-card>
        <div class="title-row">
          ${cfg.title ? `<div class="title">${cfg.title}</div>` : ''}
          ${
            areas.length > 1
              ? `<select class="area-select" id="areaSelect">${areas
                  .map(
                    (a, i) =>
                      `<option value="${i}" ${i === areaIdx ? 'selected' : ''}>${
                        a.name || 'Područje ' + (i + 1)
                      }</option>`
                  )
                  .join('')}</select>`
              : ''
          }
        </div>
        <div class="row">${cellsHtml}</div>
      </ha-card>
    `;

    const selectEl = this.shadowRoot.getElementById('areaSelect');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        this._selectArea(parseInt(e.target.value, 10));
      });
    }
  }
}

customElements.define('smece-card', SmeceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'smece-card',
  name: 'Smeće Card',
  description: 'Waste/bin collection countdown card with a country -> county -> settlement setup wizard and a small bundled schedule database (starting with Croatia / Međimurje).',
});
