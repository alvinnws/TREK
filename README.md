# TripPlanner

A full-stack travel planning web application with drag-and-drop itinerary building, place management, packing lists, and Google Maps integration.

## Features

- **Drag & Drop Planner**: Drag places from the sidebar onto day columns; reorder within days or move between days
- **Place Management**: Add places with address, price, tags, categories, reservation status, and visit time
- **Google Maps Integration**: Search Google Places to auto-fill place details (requires API key)
- **Packing Lists**: Grouped packing lists with progress tracking and quick-add suggestions
- **Trip Management**: Multiple trips with date ranges, automatic day generation
- **Categories & Tags**: Color-coded organization of places
- **Admin Panel**: User management and platform statistics
- **JWT Authentication**: Secure login and registration

## Tech Stack

- **Backend**: Node.js + Express + SQLite (better-sqlite3)
- **Frontend**: React 18 + Vite + Tailwind CSS v3
- **State**: Zustand with optimistic updates
- **DnD**: @dnd-kit/core + @dnd-kit/sortable
- **Auth**: JWT tokens
- **Icons**: lucide-react

## Default Admin Credentials

```
Email: admin@admin.com
Password: admin123
```

Change these credentials after first login in production!

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Install Server Dependencies

```bash
cd server
npm install
```

### 2. Configure Server Environment

```bash
cp .env.example .env
# Edit .env and set a secure JWT_SECRET
```

### 3. Install Client Dependencies

```bash
cd client
npm install
```

### 4. Run Development Servers

In two separate terminals:

```bash
# Terminal 1 - Server (from /server directory)
npm run dev

# Terminal 2 - Client (from /client directory)
npm run dev
```

The server runs on http://localhost:3001 and the client on http://localhost:5173.
The Vite dev server proxies /api requests to the Express server automatically.

## Production Build

### Manual

```bash
# Build the client
cd client
npm run build

# The built files go to client/dist/
# Copy them to server/public/
cp -r dist ../server/public

# Run the server in production mode
cd ../server
NODE_ENV=production node src/index.js
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# The app will be available at http://localhost:3000
```

## Environment Variables

### Server (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `JWT_SECRET` | (required) | Secret key for JWT signing |
| `NODE_ENV` | `development` | Environment mode |

In production, set a strong random JWT_SECRET (at least 32 characters).

## Google Maps API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Places API (New)**
4. Create an API key under Credentials
5. Optionally restrict the key to your domain
6. In the app: go to a trip → Settings tab → enter your API key

The Maps integration allows:
- Searching places by name/query
- Auto-filling place details (name, address, coordinates, phone, website)

## SQLite Database

The database is stored at `./data/travel.db` (relative to the server process working directory).
In Docker, this is mounted as a volume at `./data`.

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/me/maps-key`

### Trips
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:id`
- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`

### Days
- `GET /api/trips/:tripId/days`
- `POST /api/trips/:tripId/days`
- `PUT /api/trips/:tripId/days/:id`
- `DELETE /api/trips/:tripId/days/:id`

### Places
- `GET /api/trips/:tripId/places`
- `POST /api/trips/:tripId/places`
- `PUT /api/trips/:tripId/places/:id`
- `DELETE /api/trips/:tripId/places/:id`

### Assignments
- `POST /api/trips/:tripId/days/:dayId/assignments`
- `DELETE /api/trips/:tripId/days/:dayId/assignments/:id`
- `PUT /api/trips/:tripId/days/:dayId/assignments/reorder`
- `PUT /api/trips/:tripId/assignments/:id/move`

### Packing
- `GET /api/trips/:tripId/packing`
- `POST /api/trips/:tripId/packing`
- `PUT /api/trips/:tripId/packing/:id`
- `DELETE /api/trips/:tripId/packing/:id`

### Tags & Categories
- `GET/POST/PUT/DELETE /api/tags`
- `GET/POST/PUT/DELETE /api/categories`

### Maps (requires API key)
- `POST /api/maps/search`
- `GET /api/maps/details/:placeId`

### Admin
- `GET /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/stats`
