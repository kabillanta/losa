# Logic Tasks

- [ ] **Verify Firebase identity before creating school sessions**
  - Files involved: `src/app/auth/actions.ts`, `src/proxy.ts`, `src/app/dashboard/layout.tsx`
  - Description of the problem: `setFirebaseSession(uid)` accepts a raw UID from the client and writes it into the `firebase_uid` cookie without verifying a Firebase ID token. The proxy and dashboard layout then trust only the presence/value of that cookie to load a school by `firebase_uid`.
  - Why it is a problem: Anyone who can invoke the Server Action with another school's UID can impersonate that school, access its dashboard, and mutate its registrations.
  - Suggested fix: Pass the Firebase ID token from the client, verify it server-side with Firebase Admin SDK, and set a session only from the verified token subject. Treat `firebase_uid` as derived server data, not user input.
  - Priority: Critical

- [ ] **Protect Server Actions with authorization checks**
  - Files involved: `src/app/dashboard/actions.ts`, `src/app/events/[slug]/score/[school_id]/actions.ts`, `src/app/auth/actions.ts`, `src/proxy.ts`
  - Description of the problem: The app relies heavily on route/proxy checks, but Server Actions are directly callable POST endpoints. `saveEventEnrollments` only checks for a cookie UID, `submitScore` has no auth check, and `setFirebaseSession` creates the trusted cookie from client input.
  - Why it is a problem: UI-only and proxy-only protection does not secure mutations. Direct Server Action calls can create sessions, change enrollments, or submit scores outside the intended UI flow.
  - Suggested fix: Add authentication and authorization inside every Server Action. Centralize verified school/admin/judge identity lookup and call it before mutation.
  - Priority: Critical

- [ ] **Add authorization to export API routes**
  - Files involved: `src/proxy.ts`, `src/app/api/export/school/route.ts`, `src/app/api/export/event/route.ts`, `src/app/api/export/master/route.ts`
  - Description of the problem: The proxy protects `/admin` and `/attendance`, but not `/api/export/*`. The export route handlers perform no admin-session check and return school, teacher, student, phone, email, attendance, and enrollment data.
  - Why it is a problem: Sensitive operational data can be downloaded without admin authentication by calling the API URLs directly.
  - Suggested fix: Check the admin session inside each route handler, or include `/api/export/:path*` in proxy and still verify inside the handlers. Return `401` or `403` when unauthorized.
  - Priority: Critical

- [ ] **Do not expose attendance writes through public Supabase policies**
  - Files involved: `src/components/Checklist.tsx`, `src/lib/sync.ts`, `supabase/schema.sql`
  - Description of the problem: Attendance is submitted from the browser with the public Supabase client using `students.upsert`, while `supabase/schema.sql` grants public update access to all student rows.
  - Why it is a problem: Any client with the publishable key can update attendance for any student. Because the payload includes `id`, `school_id`, and `name`, a malformed upsert can also risk unintended row changes depending on table constraints.
  - Suggested fix: Move attendance submission to a server route/action that verifies the admin attendance session and only updates `is_present` for existing student IDs in the selected school. Tighten RLS to deny public updates.
  - Priority: Critical

- [ ] **Validate scores against the event rubric on the server**
  - Files involved: `src/app/events/[slug]/score/[school_id]/actions.ts`, `src/components/ScoringForm.tsx`
  - Description of the problem: `submitScore` trusts hidden `eventId`, `schoolId`, `eventSlug`, arbitrary `score_*` keys, and posted numeric values. It does not load the event rubric server-side, check criteria IDs, require all rubric items, enforce min/max, or verify `eventSlug` matches `eventId`.
  - Why it is a problem: A direct request can submit negative scores, scores above maximum, scores for nonexistent criteria, or totals under the wrong event/school combination, corrupting leaderboards.
  - Suggested fix: In the action, load the event by slug/id, validate the school and rubric server-side, reject unknown/missing criteria, clamp or reject values outside `0..max_points`, and compute the total only from validated rubric items.
  - Priority: Critical

- [ ] **Restrict score submission to participating schools and valid judges**
  - Files involved: `src/app/events/[slug]/score/[school_id]/page.tsx`, `src/app/events/[slug]/score/[school_id]/actions.ts`, `src/components/ScoringForm.tsx`
  - Description of the problem: The score page loads any school ID for an event slug, and `submitScore` accepts any `judgeName`. The school-selection page filters participating schools, but the score page/action do not enforce that relationship.
  - Why it is a problem: Scores can be submitted for schools that are not enrolled in the event, and by judge names not configured for that event.
  - Suggested fix: Before rendering and before insert, verify the school has at least one enrollment for the event and verify `judgeName` is one of that event's configured judges.
  - Priority: High

- [ ] **Fix delete-before-validate enrollment saving**
  - Files involved: `src/app/dashboard/actions.ts`
  - Description of the problem: `saveEventEnrollments` deletes all existing enrollments for the school/event before it has completed validating and preparing the replacement enrollments. If duplicate participants or later insert errors occur, the action returns an error after old enrollments are already removed.
  - Why it is a problem: A failed save can erase a school's existing registrations for that event.
  - Suggested fix: Validate the full payload first, then perform delete and insert inside a database transaction/RPC. Alternatively upsert desired rows and delete removed rows only after replacement data is known valid.
  - Priority: High

- [ ] **Enforce event registration rules server-side**
  - Files involved: `src/app/dashboard/[event_slug]/EventForm.tsx`, `src/app/dashboard/actions.ts`, `events-config.json`
  - Description of the problem: Team size, max teams, allowed classes, teacher-event detection, and field format rules are enforced in the client component, but `saveEventEnrollments` accepts `eventSlug`, arbitrary `teams`, and `isTeacherEvent` from the client without checking them against `events-config.json`.
  - Why it is a problem: Direct calls can exceed `max_teams`, underfill teams, submit invalid classes/sections/admission numbers, or mark a non-teacher event as a teacher event.
  - Suggested fix: Load the event config in the Server Action and enforce event existence, min/max team size, max teams, allowed class range, teacher-event status, and the same field regexes before writing.
  - Priority: High

- [ ] **Enforce the registration deadline on mutations**
  - Files involved: `src/components/CountdownTimer.tsx`, `src/app/page.tsx`, `src/app/dashboard/[event_slug]/EventForm.tsx`, `src/app/dashboard/actions.ts`
  - Description of the problem: The UI advertises a July 13 registration deadline and tells users they can edit until the deadline, but `saveEventEnrollments` has no deadline check.
  - Why it is a problem: Registrations can still be created or changed after the advertised cutoff through the normal dashboard or direct Server Action calls.
  - Suggested fix: Store the deadline in a server-side config/source of truth and reject enrollment mutations after it. Use that same source for display.
  - Priority: High

- [ ] **Replace weak admin session cookie with a signed server-verified session**
  - Files involved: `src/app/admin/login/actions.ts`, `src/proxy.ts`
  - Description of the problem: Admin access is represented by a static cookie value, `losa_admin_session=authenticated`, and the proxy accepts that literal value. The login action also falls back to a hard-coded default password when `ADMIN_PASSWORD` is missing.
  - Why it is a problem: A static bearer cookie has no integrity protection beyond `HttpOnly`, cannot distinguish users/sessions, and the default password can accidentally become production auth.
  - Suggested fix: Require `ADMIN_PASSWORD` to be set, remove the fallback, rate-limit login attempts, and issue a signed/encrypted session token that the proxy and route handlers verify.
  - Priority: High

- [ ] **Prevent open redirects after admin login**
  - Files involved: `src/app/admin/login/actions.ts`, `src/app/admin/login/page.tsx`
  - Description of the problem: The login form sends `returnTo` from the query string and the action calls `redirect(returnTo)` without validating it.
  - Why it is a problem: A crafted login URL can redirect an authenticated admin to an arbitrary path or external URL after password entry.
  - Suggested fix: Only allow relative internal return paths from an allowlist such as `/admin`, `/admin/print`, `/admin/leaderboard`, and `/attendance`.
  - Priority: Medium

- [ ] **Make leaderboard scoring fair across different judge counts**
  - Files involved: `src/app/admin/leaderboard/page.tsx`, `src/app/events/[slug]/page.tsx`, `events-config.json`
  - Description of the problem: The leaderboard sums all score rows per school/event and overall. The event page marks a school as `Scored` if any score row exists, even though events define multiple judges.
  - Why it is a problem: A school scored by more judges receives more total points than a school with fewer submitted judge sheets, and the UI can imply judging is complete after only one judge submits.
  - Suggested fix: Track expected judges per event. Show per-judge completion, require all judges before final ranking, or rank by average/normalized score instead of raw summed rows.
  - Priority: Medium

- [ ] **Normalize participant identifiers before lookup and duplicate checks**
  - Files involved: `src/app/dashboard/[event_slug]/EventForm.tsx`, `src/app/dashboard/actions.ts`, `supabase/student_details_schema.sql`
  - Description of the problem: The client duplicate check lowercases admission numbers, but the server stores and looks up `admission_number` exactly as submitted. There is no unique constraint on `(school_id, admission_number)`.
  - Why it is a problem: The same participant can be created multiple times with casing or spacing differences, causing duplicate student records and inconsistent enrollments/attendance.
  - Suggested fix: Normalize admission numbers server-side, use the normalized value for lookup/storage, and add a database unique constraint or index on `(school_id, normalized_admission_number)`.
  - Priority: Medium

- [ ] **Avoid using mutable school-name prefixes as team identifiers**
  - Files involved: `src/app/dashboard/actions.ts`, `src/app/dashboard/[event_slug]/page.tsx`, `src/app/admin/leaderboard/page.tsx`
  - Description of the problem: Team IDs are generated from the current school name prefix plus event slug and team number. Existing display/grouping logic treats `team_id` as the stable team identity.
  - Why it is a problem: If a school name is corrected or two schools share the same initials, team identifiers become misleading or collide visually across exports/leaderboards.
  - Suggested fix: Store a stable team number or generated team UUID, and derive display labels from current school/event data at render/export time.
  - Priority: Low

