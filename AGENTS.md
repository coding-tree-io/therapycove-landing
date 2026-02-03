# AGENTS.md

## Agent entrypoints
- Always read `AGENT_ENTRYPOINTS.md` early; it is the repo-local index for key files and commands.

## Project identity
- Therapy Cove is a modern mental health center in Athens, serving adults.
- The site represents a real practice with three practicing psychologists and must communicate trust, calm, and professionalism.
- Domain reference: https://therapycove.gr

## Version control
- We use **Conventional Commits** for every change.
- Prefer **small, incremental commits**; each development step should be a commit when feasible.
- Branch names are descriptive and purpose-based (e.g., `live/therapycove-site`).

## UI/UX standards
- Follow modern UI/UX best practices: clarity, accessibility, hierarchy, whitespace, readable typography, and mobile-first responsiveness.
- Avoid visual noise; prioritize calm, empathetic presentation appropriate for a mental health brand.
- Keep forms simple and clear; label fields explicitly and minimize friction.

## Jekyll conventions
- Keep content in `_data/` and templates in `_includes/` and `_layouts/`.
- Prefer content-driven sections and avoid hardcoded copy in templates.
- Keep assets organized and named descriptively.
- Respect GitHub Pages compatibility (no unsupported plugins).

## CMS (Decap)
- Decap CMS is used for all editable content.
- Content fields should favor rich text/markdown where helpful.
- We plan to add **free** login (e.g., Netlify Identity or GitHub OAuth) later; keep CMS config flexible for that change.

## Clean code + DDD (pragmatic)
- Use descriptive names that read like prose, even if long.
- Names should reflect the project’s **ubiquitous language** (Therapy Cove, sessions, therapists, approaches, contact, etc.).
- Keep the structure simple; apply DDD ideas where they add clarity, not complexity.

## Content alignment
- Copy and structure should reflect the existing Therapy Cove tone and content.
- The site must consistently present a modern, supportive mental health center with three psychologists operating the space.

## Current site state (as of 2026-02-03)
- Layout sections are defined in `_includes/`: hero (`#home`), audiences (`#audiences`), therapists (`#therapists`), approaches (`#approaches`), contact (`#contact`), footer.
- Localization is enabled via `jekyll-polyglot` with content in `_data/el/therapy_cove.yml` (Greek) and `_data/en/therapy_cove.yml` (English placeholders).
- Language toggle is controlled by `_config.yml` `flags.show_lang_toggle` (currently `false`).
- Navigation uses `assets/images/log-vector.svg` in the header and drawer; hero + footer use `assets/images/therapy-cove-logo.png`.
- Styles are a mix of Pico CSS (CDN), custom CSS (`assets/css/base.css`, `assets/css/layout.css`, `assets/css/modules.css` via `assets/css/therapy-cove.css`), and a Tailwind build (`assets/css/tailwind-build.css`) with Flowbite plugin utilities.
- Flowbite JS is loaded locally from `assets/vendor/flowbite/flowbite.min.js`.
- Fonts are self-hosted via `assets/css/fonts.css` (Fraunces + Sora) with Greek typography using a Helvetica-based stack in `assets/css/base.css` and language-based overrides.
- Core palette variables live in `assets/css/base.css`: `--cove-charcoal` (#333333), `--cove-ivory` (#F9ECCF), `--cove-ocean-flow` (#9DC6AA) plus RGB/soft variants.
- Approaches interaction/scroll locking logic is handled in `assets/js/approaches-tabs.js` (wheel-lock on desktop, Scrollama on coarse pointers).
- Anchor centering logic lives in `assets/js/anchor-center.js`; mobile drawer close behavior in `assets/js/nav-drawer.js`.
- SEO uses `jekyll-seo-tag`/`jekyll-sitemap` plus `_includes/seo.html`, with OG image in `assets/images/og-therapy-cove.png` and favicon assets in `assets/images/favicon*`.
