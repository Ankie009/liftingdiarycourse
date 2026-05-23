# Data Fetching

## The One Rule: Server Components Only

**All data fetching in this app MUST be done exclusively via Server Components.**

Do NOT fetch data via:
- Route handlers (`app/api/*/route.ts`)
- Client components (`"use client"`)
- `useEffect` + `fetch`
- SWR, React Query, or any client-side data fetching library
- Any mechanism other than Server Components

This is non-negotiable. If you find yourself reaching for a route handler or client-side fetch, stop and restructure your component as a Server Component instead.

## Database Queries: `/data` Directory + Drizzle ORM

All database queries MUST be written as helper functions inside the `/data` directory.

**Rules:**
1. Every database query lives in a function in `/data/*.ts`
2. All queries MUST use Drizzle ORM — **never raw SQL**
3. Every helper function MUST enforce that the logged-in user can only access their own data

### User Data Isolation — Critical

Every query that returns user data MUST filter by the authenticated user's ID. A logged-in user must never be able to read, modify, or delete another user's data — not even accidentally.

**Always:**
- Retrieve the current user's ID from the session inside the helper function (do not accept `userId` as a parameter from the caller — derive it from auth so callers cannot pass an arbitrary ID)
- Apply a `.where(eq(table.userId, currentUserId))` clause on every query

**Never:**
- Fetch all rows and filter in JS
- Accept a `userId` argument from an untrusted caller
- Skip the `userId` filter on any query that touches user-owned data

### Example Pattern

```ts
// data/workouts.ts
import { db } from "@/db"
import { workouts } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"

export async function getWorkouts() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, session.user.id))
}
```

```tsx
// app/dashboard/page.tsx  ← Server Component (no "use client")
import { getWorkouts } from "@/data/workouts"

export default async function DashboardPage() {
  const workouts = await getWorkouts()
  return <WorkoutList workouts={workouts} />
}
```

## Summary

| What | Rule |
|------|------|
| Where to fetch data | Server Components only |
| Where to put DB queries | `/data` directory |
| ORM | Drizzle ORM — no raw SQL |
| User data isolation | Filter by authenticated `userId` in every query |
| Route handlers for data | Never |
| Client-side fetching | Never |
