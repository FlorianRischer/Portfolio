# Portfolio Backend

REST API Backend für das Portfolio mit MongoDB Datenbank.

## Setup

### 1. MongoDB installieren

**Option A: Lokal mit Homebrew (macOS)**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
1. Account erstellen auf [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Cluster erstellen (kostenlos möglich)
3. Connection String kopieren

### 2. Dependencies installieren
```bash
cd backend
npm install
```

### 3. Environment konfigurieren
```bash
cp .env.example .env
# .env Datei bearbeiten mit deiner MongoDB URI
```

### 4. Server starten
```bash
# Development Mode (mit Auto-Reload)
npm run dev

# Production Build
npm run build
npm start
```

## API Endpoints

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Alle Projekte abrufen |
| GET | `/api/projects?category=ux-design` | Projekte nach Kategorie filtern |
| GET | `/api/projects?featured=true` | Featured Projekte |
| GET | `/api/projects/:id` | Einzelnes Projekt (ID oder Slug) |
| POST | `/api/projects` | Neues Projekt erstellen |
| PUT | `/api/projects/:id` | Projekt aktualisieren |
| DELETE | `/api/projects/:id` | Projekt löschen |

### Messages (Kontaktformular)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | Alle Nachrichten |
| GET | `/api/messages?read=false` | Ungelesene Nachrichten |
| POST | `/api/messages` | Neue Nachricht senden |
| PUT | `/api/messages/:id/read` | Als gelesen markieren |
| DELETE | `/api/messages/:id` | Nachricht löschen |

### Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | Alle Skills |
| GET | `/api/skills?category=design` | Skills nach Kategorie |
| POST | `/api/skills` | Neuen Skill erstellen |
| PUT | `/api/skills/:id` | Skill aktualisieren |
| DELETE | `/api/skills/:id` | Skill löschen |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server Status |

## Datenmodelle

### Project
```json
{
  "title": "Soundcloud Redesign",
  "slug": "soundcloud-redesign",
  "description": "Full project description...",
  "shortDescription": "UX/UI redesign concept",
  "category": "ux-design",
  "technologies": ["Figma", "Adobe XD"],
  "thumbnailUrl": "/images/soundcloud-thumb.png",
  "images": ["/images/soundcloud-1.png"],
  "screens": [
    {
      "title": "Home Screen",
      "description": "Main landing page redesign",
      "imageUrl": "/images/home.png"
    }
  ],
  "featured": true,
  "order": 1
}
```

### Message
```json
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "subject": "Projektanfrage",
  "message": "Ich interessiere mich für...",
  "read": false
}
```

### Skill
```json
{
  "name": "Figma",
  "icon": "figma.png",
  "category": "design",
  "proficiency": 5,
  "order": 1
}
```

## Technologien
- **Node.js** + **Express** - Web Framework
- **TypeScript** - Type Safety
- **MongoDB** + **Mongoose** - NoSQL Datenbank
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment Variables
