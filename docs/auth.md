# Auth Coding Standards

## Authentication Provider: Clerk

**This app uses Clerk for all authentication. No other auth library or custom auth implementation is permitted.**

Do not use NextAuth, Auth.js, Supabase Auth, or any other authentication solution. All sign-in, sign-up, session management, and user identity flows are handled exclusively by Clerk.

---

## Installation & Setup

Clerk is configured via environment variables. The following must be present in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Never commit these values. Never hardcode them in source files.

---

## Getting the Current User

Always retrieve the authenticated user's identity using Clerk's server-side helpers. **Never trust a `userId` passed from the client or from a caller.**

### In Server Components and `/data` helpers

```ts
import { auth } from "@clerk/nextjs/server"

const { userId } = await auth()
if (!userId) throw new Error("Unauthorized")
```

### In Server Actions

```ts
import { auth } from "@clerk/nextjs/server"

export async function myAction() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  // ...
}
```

### Never

- Do not use `useUser()` or `useAuth()` in Server Components — these are Client Component hooks only.
- Do not accept `userId` as a parameter in `/data` helper functions; always derive it from `auth()` inside the function.
- Do not call `currentUser()` when only the ID is needed — `auth()` is cheaper and sufficient.

---

## Protecting Routes

Use Clerk middleware to protect routes. Configure `clerkMiddleware` in `middleware.ts` (keep as `middleware.ts` if edge runtime is needed — see CLAUDE.md note on `proxy.ts`):

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect()
  }
})

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
}
```

All routes are protected by default unless explicitly listed as public.

---

## UI Components

Use Clerk's pre-built components for sign-in and sign-up flows. Do not build custom auth forms.

```tsx
import { SignIn } from "@clerk/nextjs"
import { SignUp } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"  // avatar + sign-out dropdown
import { SignedIn, SignedOut } from "@clerk/nextjs"  // conditional rendering
```

Place sign-in/sign-up pages at the Clerk-expected routes:

- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`

---

## Rules Summary

| What | Rule |
|------|------|
| Auth provider | Clerk only |
| Get current user (server) | `auth()` from `@clerk/nextjs/server` |
| Get current user (client) | `useAuth()` / `useUser()` hooks — client components only |
| Route protection | `clerkMiddleware` + `auth.protect()` |
| Custom auth forms | Never — use Clerk's pre-built components |
| `userId` as a parameter | Never — always derive from `auth()` server-side |
| Auth credentials in source | Never — use `.env.local` only |
