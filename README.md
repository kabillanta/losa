# LOSA Attendance and Scoring System

## The Use Case

Managing a large inter-school competition traditionally involves chaotic paper trails: manual student registrations, scattered attendance sheets, and judges passing around clipboards to calculate scores by hand. This often leads to calculation errors, massive delays in announcing winners, and huge administrative overhead.

## The Solution

This application completely digitizes and streamlines the entire event lifecycle to make it fast, efficient, and error-free:

- **Instant Registrations & Attendance:** Schools register their students digitally. On the day of the event, organizers can pull up a centralized dashboard to track school attendance and team participation in real-time.
- **Live Digital Scoring:** Judges use their mobile devices or tablets to input scores directly into the system using predefined rubrics. No more mental math or lost paper clipboards!
- **Real-time Leaderboards:** As judges submit scores, a live central dashboard automatically calculates team averages, handles ties, and projects the overall school championship rankings to the audience instantly.

By eliminating paper and automating all score calculations, this tool transforms hours of manual event administration into a seamless, professional digital experience.

---

## How to Use This Project

### 1. Local Development

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```

*Open [http://localhost:3000](http://localhost:3000) in your browser. (Note: Ensure `.env.local` is configured correctly for Firebase Auth and Supabase).*

### 2. Managing and Adding Events

Events are defined locally in `events-config.json` but must be synced to the live database for scoring.

**Step A: Update Configuration**
Edit the `events-config.json` file in the root directory to add or modify events. Each event requires:

- `name`, `slug` (unique id), `category`, `description`
- `judges` (array of names)
- `min_size`, `max_size`, `max_teams`
- `rubric` (scoring criteria and max points)

**Step B: Sync to Database**
Whenever you modify the configuration file, you **must** sync it to Supabase so judges can interact with the new events:

```bash
npx tsx scripts/seed-events.ts
```

---

*Built for **LOSA** (Lakshmi Old Students Association) by **THE TVS School Alumni**.*
