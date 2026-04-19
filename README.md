# FOM Security

Fair Oaks Mall Security Operations — shift management and personnel tracking PWA.

## Overview

This is the static frontend for the FOM Security application, deployed to `fom.castellan-security.com` via Cloudflare Pages. The app is a Progressive Web App (PWA) that officers and supervisors install on their phones for daily shift tracking, roster management, post assignments, and equipment accountability.

The backend is a separate Cloudflare Worker at `fom-security.foinventory.workers.dev`, which handles authentication, cloud sync, and persistent storage via D1.

## Structure

- `index.html` — Entry / registration landing page
- `mobile.html` — Mobile PWA (officer and exec views)
- `desktop.html` — Full desktop dashboard for supervisors
- `posting.html` — Daily posting editor
- `manifest.json` — PWA install manifest
- `sw.js` — Service worker with seamless update flow
- `icon192.png`, `icon512.png` — PWA icons

## Deployment

Pushes to `main` auto-deploy to Cloudflare Pages. No build step — the static files serve as-is.

## Service Worker Update Flow

When a new version of `sw.js` is deployed, the existing clients detect the new worker during an `update()` poll (every 30 minutes, or on tab focus), install it in the background, then immediately post a `SKIP_WAITING` message to activate it. The page reloads once on `controllerchange` to pick up the fresh HTML. No user prompt required — updates arrive seamlessly.
