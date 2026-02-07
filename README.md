# Therapy Cove

> Modern mental health center site for Therapy Cove (Athens). Calm, professional, content‑driven, bilingual.

## ✨ Overview
Therapy Cove is a Jekyll site for a real mental health center in Athens. Content lives in `_data/` and layout sections in `_includes/`. CSS is bundled into a single output for performance.

## 🧰 Tech Stack
- Jekyll + Jekyll Polyglot
- Pico CSS + Tailwind build + custom CSS
- Lightning CSS for bundling (`assets/css/site.bundle.css`)

## 🚀 Quick Start
### Prerequisites
- Ruby + Bundler
- Node.js + npm

### Install
```bash
bundle install
npm install
```

### Run locally
```bash
pwsh ./scripts/dev.ps1
```
Or:
```bash
bundle exec jekyll serve --config _config.yml,_config.local.yml
```

### Build CSS bundle
```bash
npm run build:css
```
This generates `assets/css/site.bundle.css` and must be committed.

## 🧩 Structure
- `_layouts/` layouts
- `_includes/` sections
- `_data/` localized content
- `assets/css/` styles + bundle entry
- `assets/js/` behavior

## 🌍 Localization
- Greek: `_data/gr/cove/`
- English: `_data/en/cove/`

Language toggle: `_config.yml` → `flags.show_lang_toggle`.

## ✅ Git Hooks
Husky installs on `npm install` and enforces CSS bundling before commits.

## 📦 Deployment
GitHub Pages via `.github/workflows/pages.yml` on `main`.

## 🛠️ Troubleshooting
- Bundler errors: `bundle install`
- CSS not updating: `npm run build:css` and commit the bundle
- Hooks not firing: `npm install`

## 🔐 CMS (Decap)
Decap CMS is configured; local backend can be started by the dev script when Node is available.

## 📬 Contact Form Delivery
- Delivery target is configured in Form.taxi dashboard.

## ⚖️ Privacy & Legal
- Greek legal notice: `/legal/`
- English legal notice: `/en/legal/`

## 📄 Licensing
- Code license: `LICENSE` (MIT)
- Asset rights and attributions: `ASSET_RIGHTS.md`

### Commit policy (Decap)
- Direct to `main`
- One commit per save
- Content create/update/delete: `docs(content): <action> <locale>/<entry-slug>`
- Media upload/delete: `docs(media): <action> <path>`
- Locale + area derive from Decap collection names: `gr-sections`, `gr-therapists`, `gr-approaches`, `en-sections`, `en-therapists`, `en-approaches`

---

### 📍 Site Identity
- Brand: Therapy Cove
- Location: Athens, Greece
- Tone: calm, supportive, professional
