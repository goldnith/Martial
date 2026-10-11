# MartialTrack — Stage 6 (real PostgreSQL backend)

MartialTrack is a Next.js + Prisma + PostgreSQL attendance and fee management app for the academy.

## What changed in Stage 6

- Real PostgreSQL persistence through Prisma 6.19.0.
- Masters, branches and students use database CRUD APIs.
- Student ID is the database primary key, so duplicates are rejected server-side.
- Only Student ID and Name are required.
- Branch selection is validated against the selected master on the server.
- Attendance is stored in PostgreSQL with a unique `(studentId, date)` constraint and uses `upsert`, so changing Present/Absent does not create duplicates.
- Fee payments are stored as an append-only ledger. Multiple payments for the same student/month are supported.
- Server-side fee validation prevents paying more than the remaining balance.
- Dashboard revenue bars use actual payment records from PostgreSQL.
- Refreshing the browser does not reset application data.

## Setup

1. Create a Neon/PostgreSQL database.
2. Copy the environment template:

```bash
cp .env.example .env
```

3. Put the database connection string in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

4. Install dependencies:

```bash
npm install
```

5. Generate Prisma Client and create/update tables:

```bash
npx prisma generate
npx prisma db push
```

6. Optional demo data:

```bash
npm run db:seed
```

> `db:seed` clears existing MartialTrack data first. Do not run it against a production database containing real data.

7. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Database health

Open `/api/health` to verify that `DATABASE_URL` is configured and PostgreSQL is reachable.

## API endpoints

- `GET /api/bootstrap`
- `GET|POST|PATCH|DELETE /api/masters`
- `GET|POST|PATCH|DELETE /api/branches`
- `GET|POST|PATCH|DELETE /api/students`
- `GET|POST /api/attendance`
- `GET|POST /api/payments`

The client loads data from `/api/bootstrap` and mutations are written to PostgreSQL through these API routes.


## Belt Grading
The app now includes a persistent Belt Grading module. Silambam and Karate are seeded as editable disciplines. Each discipline has editable belt levels. Open a discipline, select any student, and view every belt as a progression level. Completed belts show a check mark plus completion date and grading place. Belt awards are stored in PostgreSQL and can be added/updated.

## Loading states
All initial database loads and server-side create/update/delete/payment/attendance actions show a blocking loader so users know the request is being processed.

After adding the new Prisma models, run:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

## Stage 8 changes
- Attendance editing is locked to the current day; the API also rejects previous/future attendance edits.
- Bootstrap payload is lighter to reduce initial loading time.
- Belt Grading supports Master and Branch filters.
- Belt levels are shown as reference information on the right side.
- Belt levels can only be edited through the dedicated **Edit Belts** popup.
- Clicking a grading student opens a student-information + game-style progression popup.
- Belt achievements can only be changed through the dedicated **Edit Belt Achievement** popup.
- Achievement edits support tick/untick, completion date, grading location and note.
