# Courses Module — Production Audit Report
**Date:** 2026-03-12
**Scope:** `src/features/courses/**`

---

## 🔴 CRITICAL

### 1. Duplicate Card / Overlay Components
- `admin-course-card.tsx` duplicates ALL color maps + mutations already in `course-admin-card.tsx`
- `admin-overlay.tsx` duplicates all publish/duplicate/delete mutations already in `admin-overlay-controls.tsx`
- `course-card.tsx` uses the old `AdminOverlay`; `course-admin-card.tsx` uses the better `AdminOverlayControls`
- **Result:** 4 components doing 2 things — bugs get fixed in one place, not the other
- **Fix:** Delete `admin-course-card.tsx`, `admin-overlay.tsx`. Use `CourseAdminCard` + `AdminOverlayControls` everywhere.

### 2. `CoursesTable` Uses Wrong API (`coursesApi` instead of `adminCoursesApi`)
- Imports public `coursesApi` → wrong endpoints + wrong auth
- `queryClient.invalidateQueries({ queryKey: ['courses'] })` instead of `['admin', 'courses']` → list never refreshes after table actions
- **Fix:** Replace with `adminCoursesApi`, fix queryKey.

### 3. `window.confirm()` Used for Destructive Actions
- `courses-table.tsx` delete: `if (confirm(...))` — native browser dialog, not AlertDialog
- `admin-course-card.tsx` delete: same issue
- **Fix:** Replace all `confirm()` with `<AlertDialog>` (already implemented in `admin-overlay-controls.tsx`)

### 4. Inconsistent Color Key Casing
- `admin-course-card.tsx` maps use UPPERCASE keys (`EMERALD`, `BLUE`)
- `course-admin-card.tsx` and `course-card.tsx` use lowercase keys (`emerald`, `blue`)
- Backend type `CourseColor` is UPPERCASE → lowercase maps always fall back to defaults
- **Fix:** Normalize all to lowercase after `.toLowerCase()`, or extract shared constants.

---

## 🟠 MAJOR

### 5. No Optimistic Updates for Publish/Unpublish
- `AdminOverlay` and `AdminOverlayControls` invalidate after success → visible list reload flash
- Only delete in `admin-course-card.tsx` has optimistic update
- **Fix:** Add `onMutate` for publish toggle in `AdminOverlayControls`

### 6. No `staleTime` on Any Course Query
- Stats + list refetch on every window focus / component mount
- **Fix:** `staleTime: 30_000` on stats, `staleTime: 10_000` on list

### 7. No Retry Logic
- All queries and mutations use default React Query retry (3 for queries, 0 for mutations)
- Mutations silently fail on first network error with no recovery
- **Fix:** Set `retry: 1` on critical mutations

### 8. Large Monolithic Files
| File | Size | Problem |
|---|---|---|
| `curriculum-platform-editor.tsx` | 37 KB | Everything in one component |
| `course-create.page.tsx` | 43 KB | Page + form + tabs + logic |
| `course-preview-tab.tsx` | 19 KB | Too large for one tab |
| `content-writer-editor.tsx` | 19 KB | Needs splitting |

### 9. Missing `aria-label` on Icon-Only Buttons
- Duplicate, Delete, View buttons use `title='...'` (tooltip only, not accessible)
- Screen readers cannot identify these buttons
- **Fix:** Add `aria-label` to all icon-only buttons

### 10. No `disabled` on Publish Button During Mutation (AdminOverlay)
- User can click Publish multiple times rapidly → duplicate API calls
- `AdminOverlay` does not set `disabled={publishMut.isPending}`

### 11. Delete Error Message Non-Specific
- `AdminOverlay`: `toast.error('Failed to delete')` — no detail
- `AdminOverlayControls`: correctly extracts `err?.response?.data?.message`
- **Fix:** Standardize to detailed error messages everywhere

---

## 🟡 MODERATE

### 12. `isPublished` Computed Incorrectly in `admin-course-card.tsx`
- `const isPublished = (course as any).isPublished ?? false` — uses optional/any field
- Should be `course.state === 'PUBLISHED'` (consistent with other components)

### 13. Multiple `as any` Type Casts
- `admin-course-card.tsx`: `(course as any).image`, `(course as any).category`, `(course as any).isPublished`
- All these fields already exist in `AdminCourse` type — unnecessary casts hiding type errors

### 14. Inconsistent Env Var for Platform URL
- `admin-course-card.tsx`: `import.meta.env.VITE_FRONTEND_URL ?? 'https://test.cyber-labs.tech'`
- `admin-overlay-controls.tsx`: `import.meta.env.VITE_PLATFORM_URL ?? 'https://test.cyber-labs.tech'`
- Two different env var names for same purpose → wrong URL in one of them
- **Fix:** Standardize to `VITE_PLATFORM_URL`

### 15. Error State Has No Retry Button
- `courses-list.page.tsx` on error returns a full-page alert with no recovery action
- `refetch` is available from `useQuery` but unused
- **Fix:** Add `<Button onClick={refetch}>Try Again</Button>` in error state

### 16. Empty State Missing in Table View
- Grid view has a proper empty state card
- `CoursesTable` renders empty `<tbody>` — no message, no illustration
- **Fix:** Add empty state row when `data.length === 0`

### 17. `normalizeDiff()` Duplicated
- Defined identically in `admin-course-card.tsx` and `course-admin-card.tsx`
- **Fix:** Extract to `utils/course-utils.ts`

### 18. Animation Delay Inconsistency
- `admin-course-card.tsx`: `delay: index * 0.04`
- `course-admin-card.tsx`: `delay: index * 0.05`
- At 20 items, last card delays 0.8–1.0s — bad UX on initial load
- **Fix:** Cap at 0.3s max: `delay: Math.min(index * 0.04, 0.3)`

### 19. Missing `useCallback` on Filter Handlers
- Search/select `onChange` in `CoursesListPage` create new functions on every render
- Causes unnecessary re-renders of Select children

---

## 🟢 MINOR

### 20. `course-filters.tsx` Orphaned
- Component exists but is not imported anywhere — filter UI is inline in the page
- **Fix:** Delete or use it

### 21. `AdminOverlay` Loading Shows `'...'` String
- Not a spinner — inconsistent with rest of UI which uses `<Loader2 className='animate-spin' />`

### 22. Tailwind Physical vs Logical Properties Mixed
- `left-3` vs `start-3`, `text-left` vs `text-start` mixed in same feature
- **Fix:** Use logical properties (`start-`, `end-`) consistently for RTL support

### 23. `content-editor/` Sub-directory Not Audited
- Directory exists, contents unknown — needs review

### 24. `image-lightbox.tsx` Usage Unknown
- Small component (2.8KB) — unclear if actively used in any tab

---

## 📁 Folder Structure — Recommended Cleanup

```
DELETE:
  components/admin-course-card.tsx     ← duplicate of course-admin-card.tsx
  components/admin-overlay.tsx         ← duplicate of admin-overlay-controls.tsx
  components/course-filters.tsx        ← orphaned

CREATE:
  constants/course-colors.ts           ← shared color maps
  utils/course-utils.ts                ← normalizeDiff + other helpers
```

---

## 📊 Summary

| Category | Issues | Priority |
|---|---|---|
| Duplicate logic / dead code | 3 | 🔴 Critical |
| Wrong API usage | 1 | 🔴 Critical |
| Missing confirmation dialogs | 2 | 🔴 Critical |
| Missing optimistic updates | 1 | 🟠 Major |
| Accessibility (aria-label) | 5+ | 🟠 Major |
| Performance (staleTime, memo) | 3 | 🟡 Moderate |
| Missing states (empty/error/retry) | 2 | 🟡 Moderate |
| Type safety (`as any`) | 3 | 🟡 Moderate |
| Minor inconsistencies | 5 | 🟢 Minor |

---

## ✅ Action Plan (Execution Order)

1. Commit this audit report
2. Create `constants/course-colors.ts` — shared color maps
3. Fix `CoursesTable` — adminCoursesApi + queryKey + AlertDialog + empty state
4. Fix all `confirm()` → AlertDialog
5. Fix env var inconsistency → `VITE_PLATFORM_URL`
6. Fix `isPublished` + remove `as any` casts
7. Add `staleTime` + `retry` to queries
8. Add `aria-label` to icon-only buttons
9. Add retry button to error state in CoursesListPage
10. Cap animation delay at 0.3s
11. Delete duplicate files
12. Add optimistic update for publish in AdminOverlayControls
13. Split large files
