# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

Do not create custom components. If the UI requires a button, input, dialog, card, table, or any other element, use the shadcn/ui equivalent. If a shadcn/ui component does not yet exist in the project, add it via the CLI:

```bash
npx shadcn@latest add <component-name>
```

All shadcn/ui components live in `src/components/ui/` and must not be modified unless absolutely necessary to fix a bug.

### Rationale

- Consistency across the entire project without drift from one-off custom implementations.
- shadcn/ui components are accessible, themeable, and maintained.
- Eliminates decision fatigue around styling and structure.

---

## Date Formatting

All date formatting must use **date-fns**. No other date library (e.g. `dayjs`, `moment`, `Intl.DateTimeFormat` manual formatting) is permitted for display formatting.

### Required Format

Dates shown to users must follow this pattern:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

This is: ordinal day + 3-letter month abbreviation + 4-digit year.

### Implementation

Use the `do` token (ordinal day) and `MMM` (short month) and `yyyy` (full year) format string:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy");
// 1st Sep 2025
// 2nd Aug 2025
// 3rd Jan 2026
// 4th Jun 2024
```

### Rules

- Always import from `date-fns` directly (named imports, not a default import).
- Never construct date strings manually with string concatenation.
- Never use `toLocaleDateString` or `Intl` for display formatting.
