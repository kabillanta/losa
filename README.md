# LOSA Attendance and Event Scoring System

This project is a Next.js application built to manage school attendance, event enrollments, and live scoring for the LOSA inter-school competition.

## Project Structure and Data Flow

The application relies on a central configuration file for event definitions, but it uses Supabase (a PostgreSQL database) for live data storage such as student registrations and judging scores.

### 1. The Configuration File (events-config.json)
The `events-config.json` file located in the root directory is the absolute source of truth for all events. 

To add a new event or modify an existing one, you must edit this file. The required structure for an event is:
- name: The display name of the event.
- slug: A unique identifier (lowercase, no spaces, e.g., "science-expo").
- category: The grouping or grade level.
- description: A short description of the event rules.
- judges: An array of judge names.
- min_size: Minimum students required per team.
- max_size: Maximum students allowed per team.
- max_teams: Maximum number of teams a school can register.
- rubric: An array of criteria, each containing an id, name, and max_points.

### 2. Synchronizing with the Database
Because the application saves live scores and links them to events, the Supabase database must be kept in sync with the configuration file. 

Whenever you make changes to `events-config.json`, you must run the following command in your terminal to update the database:

```bash
npx tsx scripts/seed-events.ts
```

If you do not run this script after adding an event, the new event will not appear on the live website and judges will not be able to score it.

## Running the Application Locally

First, ensure all dependencies are installed:

```bash
npm install
```

Then, start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser to view the application.

## Authentication
The application uses Firebase Authentication for secure Google Sign-In. The configuration is handled through environment variables stored in the `.env.local` file. Ensure this file is present before starting the application.
