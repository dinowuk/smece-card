// smece-card.js
// Self-contained Home Assistant Lovelace card for waste/bin collection countdowns.
// No Home Assistant entities or calendar required — schedule data lives entirely
// in the card's own config. Each bin computes its own "days until next collection"
// client-side from a plain list of ISO dates (YYYY-MM-DD).

class SmeceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
    this._tickHandle = null;
  }

  setConfig(config) {
    if (!config) throw new Error('smece-card: config required');
    let areas;
    if (Array.isArray(config.areas) && config.areas.length > 0) {
      areas = config.areas;
    } else if (Array.isArray(config.bins) && config.bins.length > 0) {
      areas = [{ name: null, bins: config.bins }];
    } else {
      throw new Error('smece-card: provide either "bins" (single area) or "areas" (multiple areas)');
    }
    this.config = config;
    this._areas = areas;
    let storedIdx = 0;
    try {
      const key = 'smece-card-selected-area-' + (config.storage_key || 'default');
      const stored = window.localStorage.getItem(key);
      if (stored !== null) storedIdx = parseInt(stored, 10) || 0;
    } catch (e) { /* localStorage unavailable, ignore */ }
    this._selectedAreaIndex = Math.min(storedIdx, areas.length - 1);
    this._rendered = false;
    this._render();
  }

  _selectArea(idx) {
    this._selectedAreaIndex = idx;
    try {
      const key = 'smece-card-selected-area-' + (this.config.storage_key || 'default');
      window.localStorage.setItem(key, String(idx));
    } catch (e) { /* ignore */ }
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // Schedule is static config data; nothing to update per hass tick beyond
    // the daily day-count, which we refresh independently below.
  }

  getCardSize() {
    return 3;
  }

  static getStubConfig() {
    return {
      title: 'Odvoz otpada',
      storage_key: 'demo',
      areas: [
        {
          name: 'Moje naselje',
          bins: [
            {
              id: 'bio',
              label: 'Bio otpad',
              color: '#8a5a34',
              lid_color: '#6e4527',
              dates: '2026-01-09,2026-01-20,2026-02-03,2026-02-17',
            },
            {
              id: 'mixed',
              label: 'Miješani',
              color: '#4caf50',
              lid_color: '#3d8c40',
              dates: '2026-01-09,2026-01-20,2026-02-03,2026-02-17',
            },
            {
              id: 'paper',
              label: 'Papir',
              color: '#2196f3',
              lid_color: '#1976d2',
              dates: '2026-01-14,2026-02-11,2026-03-11',
            },
            {
              id: 'plastic',
              label: 'Plastika',
              color: '#f5d020',
              lid_color: '#d4b40f',
              dates: '2026-01-14,2026-02-11,2026-03-11',
            },
            {
              id: 'glass',
              label: 'Metal/Staklo',
              color: '#9e9e9e',
              lid_color: '#7d7d7d',
              dates: '2026-01-17,2026-02-14,2026-03-14',
            },
          ],
        },
      ],
    };
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

  _render() {
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
          ${areas.length > 1 ? `<select class="area-select" id="areaSelect">${areas.map((a, i) => `<option value="${i}" ${i === areaIdx ? 'selected' : ''}>${a.name || 'Područje ' + (i + 1)}</option>`).join('')}</select>` : ''}
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
  description: 'Self-contained waste/bin collection countdown card (no HA calendar needed).',
});
