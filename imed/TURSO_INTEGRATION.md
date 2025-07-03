# Turso Integration for IMED

This document explains how to set up and use Turso with the IMED application. Turso is an edge-hosted SQLite database that provides low-latency access to structured data.

## Features

- SQL-based structured storage for medical data
- Type-safe database operations with Drizzle ORM
- Efficient medicine and condition lookups
- Fast symptom-to-condition matching
- User recommendation history
- Hono API for Edge-optimized endpoints

## Architecture

The IMED application uses a hybrid approach:

1. **Firebase**: Handles authentication and user management
2. **Turso**: Stores structured medical data (medicines, conditions, recommendations)
3. **Hono**: Edge-optimized API framework for Turso data access

## Setup Instructions

### 1. Install Turso CLI

```bash
# For macOS
brew install tursodatabase/tap/turso

# For Linux/WSL
curl -sSfL https://get.tur.so/install.sh | bash

# For Windows
winget install --id Turso.CLI
```

### 2. Sign Up or Login

```bash
turso auth signup   # First-time users
# OR
turso auth login    # Existing users
```

### 3. Create a Turso Database

```bash
turso db create imed-medicines
```

### 4. Get Database URL and Auth Token

```bash
# Get Database URL
turso db show imed-medicines --url

# Create Auth Token
turso db tokens create imed-medicines
```

### 5. Set Environment Variables

Create or update your `.env.local` file with Turso credentials:

```
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

### 6. Generate Schema and Push to Turso

```bash
# Generate the SQL schema from Drizzle ORM definitions
npm run drizzle:generate

# Push the schema to your Turso database
npm run drizzle:push

# Setup the database and seed initial data
npm run turso:setup
```

## Turso + Drizzle Data Model

### Main Tables

1. **medicines** - Information about medications
   - Properties: name, generic name, description, prescription status, etc.

2. **conditions** - Medical conditions and their symptoms
   - Properties: name, description, symptoms array, severity, etc.

3. **recommendations** - User-specific medicine recommendations
   - Properties: user ID, condition, symptoms, age, gender, etc.

4. **users** - Synced with Firebase Auth, includes extra user metadata

### Join Tables

1. **medicine_conditions** - Many-to-many relationship between medicines and conditions
2. **recommendation_medicines** - Medicines associated with each recommendation

## API Routes

The IMED app includes API endpoints for accessing Turso data:

- `/api/turso-medicine`: Next.js API route that processes symptom descriptions and returns recommended medicines.
- `/api/hono/*`: Hono-powered Edge API endpoints for CRUD operations on medicines and conditions.

## Hono API Integration

IMED uses Hono as a lightweight, edge-optimized API framework that works seamlessly with Turso and Drizzle.

### Endpoints

- `GET /api/hono/medicines`: Fetch all medicines
- `GET /api/hono/medicines/:id`: Get a specific medicine by ID
- `POST /api/hono/medicines`: Create a new medicine
- `PUT /api/hono/medicines/:id`: Update a medicine
- `DELETE /api/hono/medicines/:id`: Delete a medicine
- `GET /api/hono/conditions`: Fetch all conditions
- `GET /api/hono/conditions/:id`: Get a specific condition with associated medicines
- `POST /api/hono/recommend`: Get medicine recommendations based on symptoms
- `GET /api/hono/user/:userId/recommendations`: Get recommendation history for a user

### Hono with Vercel Configuration

IMED uses Vercel Edge Functions to run the Hono API, configured in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/hono/(.*)",
      "destination": "/api/hono"
    }
  ],
  "env": {
    "NODEJS_HELPERS": "0"
  },
  "functions": {
    "src/app/api/hono/route.ts": {
      "runtime": "edge"
    }
  }
}
```

### Demo

A Hono API demo is available at `/hono` that shows how to use the API with React components.

## Usage Examples

### Medicine Service

```typescript
// Import the medicine service
import { TursoMedicineService } from '@/lib/services/turso-medicine-service';

// Create an instance
const medicineService = new TursoMedicineService();

// Match symptoms to conditions
const matchedConditions = await medicineService.matchSymptomsToConditions([
  "headache",
  "sensitivity to light",
  "nausea"
]);

// Get medicines for a condition
const medicines = await medicineService.getMedicinesForCondition(conditionId);

// Save a user recommendation
await medicineService.saveRecommendation({
  userId,
  conditionId,
  symptoms,
  medicineIds
});
```

### Hono API Example

```typescript
// Client-side API calls
// Fetch medicines
const response = await fetch('/api/hono/medicines');
const data = await response.json();
const medicines = data.medicines;

// Create a new medicine
await fetch('/api/hono/medicines', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Aspirin',
    description: 'Pain reliever and fever reducer'
  })
});
```

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify your Turso auth token is correct in `.env.local`
   - Token may have expired; generate a new one with `turso db tokens create`

2. **Cannot Connect to Database**
   - Check internet connectivity
   - Verify the database URL is correct

3. **Migration Issues**
   - If schema changes cause conflicts, consider dropping and recreating tables
   - For production, use proper migration strategies

4. **Hono API Issues**
   - Make sure `NODEJS_HELPERS=0` is set in your environment
   - Check that your Vercel configuration correctly maps API routes
   - Use proper content types for API requests

## Recommended Development Workflow

1. Update schema in `src/lib/db/schema/*.ts` files
2. Run `npm run drizzle:generate` to update SQL schema
3. Run `npm run drizzle:push` to apply changes to your Turso database
4. Use `TursoMedicineService` to interact with the database
5. Update Hono API routes as needed for new functionality

## Production Considerations

1. **Database Size**: Turso has different limits based on your plan
2. **Query Performance**: Keep indexes on frequently queried columns
3. **Schema Migrations**: Plan database changes carefully
4. **Replication**: Consider using Turso's replication features for lower latency
5. **Edge Deployment**: Hono and Turso work well at the edge for optimal performance

## Resources

- [Turso Documentation](https://docs.turso.tech/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Hono Documentation](https://hono.dev/)
- [SQLite Documentation](https://www.sqlite.org/docs.html) 