# Decap CMS Auth (Cloudflare Worker + Access)

This worker provides a **no‑GitHub‑login** Decap CMS auth flow. Cloudflare Access handles Google login, then the worker returns a GitHub token to Decap.

## Overview
- Admin logs in with Google (via Cloudflare Access).
- Worker validates the authenticated email.
- Worker returns a GitHub token to Decap (token stored as a secret).

## Requirements
- Cloudflare account (free tier is fine).
- Cloudflare Access enabled (Zero Trust).
- GitHub Personal Access Token with **repo** access to `coding-tree-io/therapycove`.

## 1) Create the Worker
Create a Worker named `therapycove-cms-auth` and paste `worker.js` contents.

## 2) Add Worker Secrets
Add these secrets in Cloudflare Workers:
- `GITHUB_TOKEN` — GitHub PAT with repo write access
- `CMS_ALLOWED_EMAILS` — comma‑separated list of allowed emails
- `CMS_ALLOWED_DOMAINS` — optional, comma‑separated list of allowed domains
- `CMS_ORIGIN` — the CMS origin, e.g. `https://therapycove.gr` (or GitHub Pages URL)

Example:
```
CMS_ALLOWED_EMAILS=psychologist@example.com
CMS_ORIGIN=https://therapycove.gr
```

## 3) Protect the Worker with Cloudflare Access
1. Go to **Zero Trust → Access → Applications → Add application**.
2. Type: **Self‑hosted**.
3. Domain: `therapycove-cms-auth.<your-account>.workers.dev`.
4. Identity provider: **Google**.
5. Access policy: allow only the psychologist’s Google account.

This ensures only authenticated Google users can hit the worker.

## 4) Update Decap Config
In `admin/config.yml` (already set):
```
backend:
  name: github
  repo: coding-tree-io/therapycove
  branch: main
  auth_endpoint: https://therapycove-cms-auth.<your-account>.workers.dev/auth
```

## 5) Test
- Visit `/admin` on the site.
- Click **Login**.
- You should be redirected to Google via Cloudflare Access.
- After success, the CMS should load and allow edits.

## Notes
- **No GitHub login** is required for the admin.
- The PAT never leaves the Worker.
- Use the GitHub Pages URL in `CMS_ORIGIN` if not yet on a custom domain.
