# Data Mutations Coding Standards

## The Two-Layer Rule

All data mutations follow a strict two-layer pattern:

1. **`/data` helper** — a typed function wrapping a Drizzle ORM call
2. **Server Action in `actions.ts`** — validates input with Zod, calls the `/data` helper

Never write Drizzle calls directly inside a Server Action. Never mutate data from a Client Component or route handler.

---

## Layer 1: `/data` Mutation Helpers

All database mutation logic MUST live as helper functions inside `src/data/`.

**Rules:**
- One file per domain (e.g. `src/data/workouts.ts`, `src/data/exercises.ts`)
- Use Drizzle ORM for every query — **never raw SQL**
- Every mutation that operates on user-owned data MUST derive the current user's ID from `auth()` internally — never accept `userId` as a parameter
- Functions must be `async` and return a typed result

```ts
// src/data/workouts.ts
import { db } from "@/db"
import { workouts } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function createWorkout(name: string, date: Date) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning()

  return workout
}

export async function deleteWorkout(workoutId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db
    .delete(workouts)
    .where(eq(workouts.id, workoutId) && eq(workouts.userId, userId))
}
```

---

## Layer 2: Server Actions in `actions.ts`

All Server Actions MUST be defined in a colocated `actions.ts` file next to the page or component that uses them.

```
src/app/dashboard/
  page.tsx
  actions.ts       ← Server Actions live here
```

**Rules:**
- The file MUST have `"use server"` at the top
- Every action MUST validate its arguments using **Zod** before doing anything else
- Parameters MUST be explicitly typed — **never use `FormData` as a parameter type**
- Actions call `/data` helpers — they do not contain Drizzle logic themselves
- Return a typed result (or throw on failure)

```ts
// src/app/dashboard/actions.ts
"use server"

import { z } from "zod"
import { createWorkout } from "@/data/workouts"

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
})

export async function createWorkoutAction(input: {
  name: string
  date: Date
}) {
  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  return createWorkout(parsed.data.name, parsed.data.date)
}
```

---

## What Not To Do

| Pattern | Why it's banned |
|---------|----------------|
| `FormData` parameter type | Untyped, bypasses Zod schema shape, forces manual field extraction |
| Drizzle calls inside `actions.ts` | Violates the two-layer separation; mutations must go through `/data` |
| Mutations in route handlers | All mutations use Server Actions only |
| Mutations in Client Components | No direct DB access from the client |
| Skipping Zod validation | Actions are a public boundary; all input must be validated |
| Accepting `userId` as a param | Always derive from `auth()` inside the `/data` helper |
| Raw SQL | Drizzle ORM only |
| `redirect()` inside a Server Action | Redirects must be handled client-side after the action resolves — call `router.push()` in the Client Component, never `redirect()` inside `actions.ts` |

---

## Summary

| What | Rule |
|------|------|
| Where DB mutation logic lives | `src/data/*.ts` helpers |
| ORM | Drizzle ORM — no raw SQL |
| Where Server Actions live | Colocated `actions.ts` next to the page/component |
| Server Action params | Explicitly typed — no `FormData` |
| Input validation | Zod — every action, no exceptions |
| User identity in mutations | Derived from `auth()` inside `/data` helper — never passed as a param |
| Mutations from route handlers | Never |
| Mutations from Client Components | Never |
| Redirects inside Server Actions | Never — use `router.push()` client-side after the action resolves |
