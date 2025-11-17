# LinkSaver

A Chrome extension + web app to save, tag, and manage links. This monorepo contains three parts:

- api — Node.js/Express REST API with MongoDB
- ui — React (Vite) single‑page app for managing saved links
- extension — Chrome extension (Manifest V3) that lets you save the current tab, manage tags, and open the UI

The project targets a local developer setup with hot reload for the extension and Dockerized backend for convenience.


## Features
- Save the current page from the browser via the Chrome extension
- Organize links with tags
- User authentication (JWT)
- REST API secured by CORS and a custom header for cross‑origin access
- Developer tooling: Docker Compose for API + MongoDB, Vite for UI, Webpack for the extension with hot reload


## Repository structure
```
linksaver/
├─ api/           # Express API + MongoDB models/routes
├─ ui/            # React Vite app
├─ extension/     # Chrome extension (Manifest V3)
├─ LICENSE
└─ README.md
```


## Tech stack
- Backend: Node.js, Express, Mongoose, JWT, Nodemailer
- Database: MongoDB (with optional Mongo Express UI for dev)
- Frontend: React 18, Vite
- Extension: Chrome MV3, React, Webpack 5
- Tooling: Docker, Docker Compose, ESLint


## Prerequisites
- Node.js 18+ (Node 20 recommended)
- npm 9+
- Docker and Docker Compose (for running the API + MongoDB locally)
- Google Chrome/Chromium (for loading the extension)


## Environment variables

### API (api/.env)
Template (see existing `api/.env`):
```
PORT=7777
NODE_ENV="development"
UI_URL="http://localhost:5173"
MONGODB_URI="mongodb://root:pass@host.docker.internal:27017/linksaver?authSource=admin"
JWT_SECRET="<your-secret>"
MAIL_HOST="sandbox.smtp.mailtrap.io"
MAIL_PORT=2525
MAIL_USER="<your-user>"
MAIL_PASS="<your-pass>"
```
Notes:
- `UI_URL` must point to the UI’s origin and is enforced in `api/src/app.js` CORS + a custom header check.
- If you access the API from somewhere other than the UI origin, you must add the header `X-Link-Saver: <any>` on requests (see Security section below).

### Extension (extension/.env.development)
```
UI_URL="http://localhost:5173"
API_URL="http://localhost:7777"
```
The extension manifest includes host permissions for `http://localhost:7777/*` in development.

### UI (ui/.env.development)
```
VITE_API_URL="http://localhost:5173/api"
```
Depending on how you expose the API, you may want this to be `http://localhost:7777` or configure a Vite proxy to forward `/api` to the API. See the UI section below.


## Quick start (development)

1) Start the API + MongoDB with Docker (dev mode)
```
cd api
npm install
npm run dev
```
This builds and runs:
- API on http://localhost:7777
- MongoDB on mongodb://localhost:27017 (credentials: root/pass)
- Mongo Express on http://localhost:8088 (basic auth disabled in dev)

2) Start the UI (Vite)
```
cd ../ui
npm install
npm run dev
```
Vite serves the app on http://localhost:5173.

3) Build and load the Chrome extension (development)
```
cd ../extension
npm install
npm run dev
```
This will build into `extension/build` and enable extension hot‑reload while the watcher runs.

Load it into Chrome:
- Open chrome://extensions
- Enable “Developer mode”
- Click “Load unpacked” and select the `extension/build` folder


## Running the API

With Docker (recommended for dev):
```
cd api
npm run dev           # docker-compose up (dev)
# or build images first
npm run dev:build     # docker-compose build (dev)
# stop the stack
npm run dev:stop
```

Without Docker (requires local MongoDB):
```
cd api
npm install
npm run start:dev
```
Make sure `MONGODB_URI` in `api/.env` points to your Mongo. Default dev docker-compose expects `host.docker.internal` from inside the container. For local Node, use `mongodb://localhost:27017/linksaver` with proper auth init or remove auth for local testing.


## Running the UI

```
cd ui
npm install
npm run dev
```
Vite runs on http://localhost:5173.

About API URL:
- The sample `ui/.env.development` uses `VITE_API_URL="http://localhost:5173/api"` which assumes a dev proxy. If you want to call the API at `http://localhost:7777` directly, set `VITE_API_URL="http://localhost:7777"` and ensure CORS/headers are satisfied.
- To use a Vite dev proxy, add a `server.proxy` entry in `vite.config.js` to forward `/api` to `http://localhost:7777` (not included by default in this repository at the time of writing).


## Building and loading the extension

Development build (with watch + hot reload):
```
cd extension
npm install
npm run dev
```

Production build:
```
cd extension
npm run build
```
Artifacts are generated into `extension/build`. Load this directory via chrome://extensions → Load unpacked.


## Security and headers
The API applies CORS and an extra request filter in `api/src/app.js`:
- Requests are allowed if the Origin matches `UI_URL`, or
- If the request includes the custom header `X-Link-Saver` (any non-empty value), or
- If it is a preflight `OPTIONS` request.

If you’re calling the API from the extension or tooling that isn’t the UI origin, ensure you set the header:
```
X-Link-Saver: 1
```


## Useful scripts

API:
- `npm run dev` — docker-compose up (dev)
- `npm run dev:build` — docker-compose build (dev)
- `npm run dev:stop` — docker-compose stop (dev)
- `npm run start:dev` — run API locally with nodemon

UI:
- `npm run dev` — Vite dev server
- `npm run build` — Vite build
- `npm run preview` — Vite preview

Extension:
- `npm run dev` — Webpack watch + hot reload for extension
- `npm run build` — Production build


## Troubleshooting
- API says “403 Forbidden” from the UI or extension:
  - Ensure your request either originates from `UI_URL` or includes header `X-Link-Saver`.
  - Confirm CORS preflight success and that `allowedHeaders` include the headers you’re sending (`Content-Type`, `Authorization`, `X-Link-Saver`).
- UI cannot reach API:
  - Verify `VITE_API_URL` matches your API endpoint and that the API container exposes `7777`.
  - If using a proxy path (`/api`), make sure Vite is configured to proxy to `http://localhost:7777`.
- Mongo connection fails in Docker dev:
  - The compose file brings up Mongo with auth (root/pass). The API `MONGODB_URI` in `.env` should match. For connections from inside the API container, `host.docker.internal` is used; from host or other containers, use the appropriate hostname (`mongo`) or `localhost`.
- Extension not reloading during development:
  - Keep `npm run dev` running in `extension`. Reload the unpacked extension in chrome://extensions if necessary.


## CMS (Plugin‑based dynamic pages)

This repo includes an experimental, extensible CMS composed of two microservices that render pages from a JSON DSL and a plugin registry.

- cms-sdk — shared library with IoC container, DSL validators (Ajv), plugin registry, renderers, and middleware utilities.
- cms-composer — service that loads a page JSON (from Mongo), runs middleware (locale, feature flags, A/B), validates, and returns composed JSON.
- cms-renderer — service that validates a node tree and renders HTML (or echoes JSON), using a plugin allowlist loaded from Mongo.

Ports (defaults):
- cms-composer: 7781
- cms-renderer: 7782

JSON DSL (simplified):
```
Page: {
  version: string,             // e.g., "1.0.0"
  meta: { slug?: string, title?: string, locale?: string },
  root: Node
}

Node: {
  type: string,                // plugin id
  params: object,              // plugin params (validated by per‑plugin schema)
  children?: Node[]
}
```

Built‑in plugins (initial set): `Container`, `TextBlock`, `Image`, `List`.

Endpoints:
- Composer: `GET /v1/pages/:slug`
  - Headers: follows the same security policy as the API — either `Origin` matches `UI_URL` or include header `X-Link-Saver: 1`.
  - Optional headers/params: `Accept-Language`, `?locale=`; feature flags via `X-Flags: flagA,flagB`.
- Renderer: `POST /v1/render`
  - Body: `{ page }` (full page) or `{ tree }` (node tree only)
  - HTML response when `Accept: text/html` or `?format=html`; otherwise JSON `{ tree, meta?, version? }`.

Environment variables:
- Services
  - `UI_URL` — e.g., `http://localhost:5173` (used in CORS/header checks)
  - `CMS_MONGODB_URI` — e.g., `mongodb://root:pass@mongo:27017/linksaver?authSource=admin`
  - `CMS_DB_NAME` — default `linksaver`
- UI (Vite)
  - `VITE_CMS_COMPOSER_URL` — default `http://localhost:7781`
  - `VITE_CMS_RENDERER_URL` — default `http://localhost:7782`

Run the CMS stack (Docker Compose):
```
npm run cms:build          # optional: build images
npm run cms:up             # starts cms-composer, cms-renderer, mongo, mongo-express
npm run cms:seed           # seed demo page and activate built-in plugins
# stop
npm run cms:down
```

Quick demo:
- Open the UI route at `http://localhost:5173/cms/home`.
  - The UI fetches `GET http://localhost:7781/v1/pages/home` and renders using client-side plugin components.
  - You can pass `?locale=fr` to influence locale resolved by composer (if used by your UI).

Curl demo:
```
# Get composed page JSON from composer
curl -H "Origin: http://localhost:5173" \
  http://localhost:7781/v1/pages/home | jq

# Render the tree to HTML via renderer
curl -H "Origin: http://localhost:5173" -H "Accept: text/html" \
  -H 'Content-Type: application/json' \
  -d '{"tree":{"type":"TextBlock","params":{"text":"Hello"}}}' \
  http://localhost:7782/v1/render
```

Notes
- Security: Both services mirror the API’s CORS/header rule — non‑UI origins must include `X-Link-Saver`.
- Plugins allowlist: `cms-renderer` loads active plugin IDs from the `plugins` collection in Mongo.
- Middleware: `cms-composer` applies locale resolution, feature flags (prunes nodes via `params.featureFlag`), and A/B bucketing.


## License

This project is licensed under the terms of the LICENSE file in the repository root.