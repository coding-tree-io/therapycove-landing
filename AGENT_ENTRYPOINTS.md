# Agent Entrypoints

This file lists the highest-value files and commands to read first when working on this repo.

## Config
- _config.yml
- _config.local.yml
- Gemfile
- Gemfile.lock

## Layouts
- _layouts/default.html

## Key includes (structure and content)
- _includes/site-nav.html
- _includes/hero.html
- _includes/audiences.html
- _includes/therapists.html
- _includes/approaches.html
- _includes/contact.html
- _includes/footer.html
- _includes/seo.html

## Data (primary content)
- _data/el/therapy_cove.yml
- _data/en/therapy_cove.yml

## Styles
- assets/css/base.css
- assets/css/layout.css
- assets/css/modules.css
- assets/css/therapy-cove.css (imports the three files above)

## Scripts
- assets/js/approaches-tabs.js

## Build / Dev commands
- PowerShell (Windows): `pwsh ./scripts/dev.ps1`
- Jekyll (manual): `bundle exec jekyll serve --config _config.yml,_config.local.yml`
- CSS bundle: `npm run build:css`
- Git hooks (Husky): `npm install` (runs `prepare`)
