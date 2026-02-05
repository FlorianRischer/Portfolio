# Portfolio - Cloudflare Deployment

## Architektur

Das Projekt wird auf Cloudflare gehostet mit:
- **Cloudflare Pages** - Frontend (Vite + React)
- **Cloudflare Workers** - Backend API
- **Cloudflare D1** - SQLite Datenbank
- **Cloudflare R2** - Bild-Storage

## 🚀 Deployment-Anleitung

### 1. MongoDB-Daten exportieren

```bash
# Im Backend-Ordner
cd backend
npm run export
```

Dies erstellt den `exports/` Ordner mit:
- `images/` - Bilddateien für R2
- `schema.sql` - Datenbank-Schema
- `seed.sql` - Daten für D1
- `projects.json`, `skills.json`, `images.json` - JSON-Exporte

### 2. Cloudflare CLI installieren

```bash
npm install -g wrangler
wrangler login
```

### 3. D1 Datenbank erstellen

```bash
cd workers

# Datenbank erstellen
npm run db:create

# Kopiere die database_id aus dem Output und füge sie in wrangler.toml ein
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Schema ausführen
npm run db:migrate

# Daten importieren
npm run db:seed
```

### 4. R2 Bucket erstellen und Bilder hochladen

```bash
cd workers

# Bucket erstellen
npm run r2:create

# Bilder hochladen
npm run r2:upload
```

### 5. Worker deployen

```bash
cd workers
npm install
npm run deploy
```

Notiere die Worker-URL (z.B. `https://portfolio-api.YOUR_SUBDOMAIN.workers.dev`)

### 6. Frontend für Cloudflare Pages konfigurieren

1. Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages**
2. Klicke auf **Create a project** → **Connect to Git**
3. Wähle dein Repository

**Build-Einstellungen:**
| Einstellung | Wert |
|-------------|------|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `frontend/dist` |
| Root directory | `/` |

**Environment Variables:**
| Variable | Wert |
|----------|------|
| `VITE_API_BASE_URL` | `https://portfolio-api.YOUR_SUBDOMAIN.workers.dev/api` |

### 7. Custom Domain (optional)

1. In Cloudflare Pages → Settings → Custom domains
2. Domain hinzufügen und DNS automatisch konfigurieren lassen
3. In Workers → Settings → Triggers → Custom domains
4. API Domain hinzufügen (z.B. `api.deine-domain.de`)

## 📁 Projektstruktur

```
Portfolio/
├── frontend/           # React Frontend
│   ├── src/
│   └── dist/          # Build Output (für Pages)
├── backend/           # Express Backend (nur für lokale Entwicklung)
│   ├── src/
│   └── exports/       # Exportierte Daten für Cloudflare
└── workers/           # Cloudflare Workers API
    ├── src/
    │   └── index.ts   # Worker Entry Point
    ├── scripts/
    │   └── upload-images.js
    └── wrangler.toml  # Worker Konfiguration
```

## 🔧 Lokale Entwicklung

### Option 1: Mit MongoDB (Original)
```bash
# Root-Ordner
npm run dev
```

### Option 2: Mit Cloudflare (lokal)
```bash
# Frontend
cd frontend
npm run dev

# Worker (in neuem Terminal)
cd workers
npm run dev
```

## 🔑 Environment Variables

### Frontend (Cloudflare Pages)
- `VITE_API_BASE_URL` - URL zum API Worker

### Worker (wrangler.toml)
- `DB` - D1 Database Binding
- `IMAGES` - R2 Bucket Binding

## 📝 API Endpoints

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/projects` | Alle Projekte |
| GET | `/api/projects?category=ux-design` | Projekte nach Kategorie |
| GET | `/api/projects?featured=true` | Featured Projekte |
| GET | `/api/projects/:slug` | Einzelnes Projekt |
| GET | `/api/skills` | Alle Skills |
| GET | `/api/skills?category=design` | Skills nach Kategorie |
| GET | `/api/images/:slug` | Bild aus R2 |
| POST | `/api/messages` | Kontaktformular |
| GET | `/api/health` | Health Check |

## 💰 Kosten

Cloudflare bietet großzügige Free Tiers:
- **Pages**: Unbegrenzte Requests
- **Workers**: 100.000 Requests/Tag
- **D1**: 5GB Storage, 5M Reads/Tag
- **R2**: 10GB Storage, 10M Reads/Monat

Für ein Portfolio-Projekt reicht der Free Tier vollkommen aus!
