# AGENTS.md

## Project identity
- Therapy Cove is a modern center for psychological health in Athens, serving adults.
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
