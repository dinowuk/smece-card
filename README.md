# smece-card

A self-contained Home Assistant Lovelace card for waste/bin collection countdowns — no external calendar integration, no template sensors, no `calendar:` entities required. The full schedule lives directly in the card's own YAML config, and the card computes "days until next collection" itself, client-side, for each bin.

Built for household waste schedules in Croatia (and easily adaptable anywhere), where most municipal waste companies publish a yearly PDF/paper calendar rather than a machine-readable API.

![screenshot placeholder](https://github.com/user-attachments/assets/placeholder)

## Why not use `calendar:` / a template sensor?

You can, but for a fixed yearly schedule (the common case for Croatian "komunalno poduzeće" waste calendars) it's simpler to keep the whole thing self-contained in one card: no `configuration.yaml` edits, no restarts to change a date — just edit the card's own config from the dashboard UI and it updates immediately.

## Installation

### HACS (recommended)

1. HACS → Frontend → ⋮ → **Custom repositories**
2. Add `https://github.com/dinowuk/smece-card`, category **Lovelace**
3. Install, hard refresh your browser

### Manual

1. Copy `smece-card.js` to `/config/www/smece-card.js`
2. Add as a Lovelace resource: `url: /local/smece-card.js`, `type: module`

## Configuration

```yaml
type: custom:smece-card
title: "Odvoz otpada"
bins:
  - id: bio
    label: "Bio otpad"
    color: "#8a5a34"
    lid_color: "#6e4527"
    dates: "2026-01-09,2026-01-20,2026-02-03,2026-02-17"
  - id: mixed
    label: "Miješani"
    color: "#4caf50"
    lid_color: "#3d8c40"
    dates: "2026-01-09,2026-01-20,2026-02-03,2026-02-17"
  - id: paper
    label: "Papir"
    color: "#2196f3"
    lid_color: "#1976d2"
    dates: "2026-01-14,2026-02-11,2026-03-11"
  - id: plastic
    label: "Plastika"
    color: "#f5d020"
    lid_color: "#d4b40f"
    dates: "2026-01-14,2026-02-11,2026-03-11"
  - id: glass
    label: "Metal/Staklo"
    color: "#9e9e9e"
    lid_color: "#7d7d7d"
    dates: "2026-01-17,2026-02-14,2026-03-14"
```

### Options

| Key | Required | Description |
|---|---|---|
| `title` | no | Card header text |
| `bins` | yes | Array of bin definitions (see below) |

### Bin object

| Key | Required | Description |
|---|---|---|
| `id` | no | Free-form identifier (not currently used for logic, useful for your own reference) |
| `label` | yes | Text shown under the bin |
| `color` | yes | Bin body colour (any CSS colour) |
| `lid_color` | no | Bin lid colour (defaults to `color` if omitted) |
| `dates` | yes | Comma-separated list of collection dates in `YYYY-MM-DD` format |

The card always shows **today's date's nearest upcoming entry** per bin: a live day-count ("X d", or "DANAS" / "SUTRA" for today/tomorrow), plus the exact next date underneath. When you reach a new year, just paste in next year's dates from your municipality's new calendar.

There is no visual editor yet — edit the config in YAML mode (click the card, "Edit in YAML"). A visual editor (add/remove bins, per-bin colour picker) is a natural next step.

## Roadmap

- [ ] Visual editor (no YAML needed)
- [ ] Optional: point a bin at an HA entity instead of a static date list, for municipalities with an automatable source
- [ ] Bin icon picker (choose from a small built-in icon set, not just flat colour)
- [ ] More Balkan-region municipalities documented with ready-to-paste date lists

## License

MIT
