# Mufasa — Code Review

**HEAD** `3c038c1` · 25 modules · 5,237 lines · Stack: Vite · React 18 · TypeScript · Zustand · Supabase · Gemini

---

## Summary

| Severity | Count |
|---|---|
| 🔴 Critical | 1 |
| 🟠 Warning | 3 |
| ⚪ Cleanup | 3 |
| 🔵 Note | 2 |

---

## 🔴 Critical

### 1. Hardcoded Gemini API key in client source
**File:** `src/lib/aiFood.ts:3`

The Google Gemini key is a string literal compiled straight into the JS bundle. Anyone can open devtools, read it, and bill calls to your project — there is no way to scope or revoke it without a redeploy.

**Fix:** Rotate the key now. Proxy Gemini calls through a Supabase Edge Function or backend so the secret never reaches the browser.

---

## 🟠 Warnings

### 2. Errors swallowed by empty catch blocks
**File:** `src/store/useStore.ts:88, 124, 163, 178`

Four `catch (e) {}` blocks silently drop failures from plan generation, profile save, and initial data load. A failed AI call or network error leaves the user on a spinner with no feedback and nothing in the logs.

**Fix:** Surface an error state in the store and render a retry path; at minimum log the error.

---

### 3. Personal records live only in localStorage
**File:** `src/store/useStore.ts:44`, `logPR()`

PRs are read with an unguarded `JSON.parse` at module init and never written to Supabase. They vanish on a new device or browser, and corrupted storage throws before the app mounts — unlike every other entity, which is persisted server-side.

**Fix:** Wrap the parse in `try/catch` and persist PRs to a Supabase table alongside the other data.

---

### 4. Supabase URL & key hardcoded
**File:** `src/lib/supabase.ts:4`

The anon key is public by design, so this is lower risk — but it's a literal rather than an env var, so rotating it or pointing at a staging project means editing source. Confirm Row Level Security is enforced, since the anon key grants whatever RLS allows.

**Fix:** Move URL + anon key to `import.meta.env` (as `gemini.ts` already does for the Gemini key) and audit RLS policies.

---

## ⚪ Cleanup

### 5. `groq.ts` is dead code
**File:** `src/lib/groq.ts` (176 lines)

Not imported anywhere. Re-implements `generateAIPlan`, which the store actually pulls from `gemini.ts` — a stale duplicate that will drift from the real one and mislead reviewers.

**Fix:** Delete the file, or document why it's retained.

---

### 6. `algorithm.ts` is an empty stub
**File:** `src/lib/algorithm.ts` (2 lines)

Contains only `export {}` and a comment saying logic moved to `gemini.ts`. Pure noise in the tree.

**Fix:** Remove it.

---

### 7. `react-router-dom` installed but unused
**File:** `package.json → dependencies`

No file imports react-router. `App.tsx` routes via a local `useState` string and a switch. The dependency adds bundle weight and implies a routing model the app doesn't use.

**Fix:** Drop the dependency, or adopt it intentionally if real URLs / deep-links are wanted.

---

## 🔵 Notes

### 8. Type cast hides the deactivated flag
**File:** `src/App.tsx:62`

`(profile as any).deactivated` casts away type safety because `deactivated` isn't on the `Profile` type — yet it gates a whole screen.

**Fix:** Add `deactivated` / `deactivated_at` to the `Profile` type in `src/types/index.ts` and drop the cast.

---

### 9. Oversized screen modules
**Files:** `src/screens/WorkoutScreen.tsx` (854 lines) · `src/screens/NutritionScreen.tsx` (551 lines)

These two files are 27% of all source. Large single-file screens are harder to review and test; they're the natural first targets for extracting hooks and subcomponents.

**Fix:** Split out data/logic hooks and presentational pieces as the screens grow.
