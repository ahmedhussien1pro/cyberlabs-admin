# Courses Module — Production Audit Report

**Date:** 2026-03-12  
**Scope:** `src/features/courses/**`  
**Status:** Feature-complete. Ready for hardening.

---

## 1. Component Structure

| File | Size | Issues |
|------|------|--------|
| `curriculum-platform-editor.tsx` | 37 KB | ❌ Monolithic — 5+ sub-components in one file |
| `course-create.page.tsx` | 37 KB | ❌ Monolithic — JsonImportModal, InstructorPicker, main page all in one file |
| `content-writer-editor.tsx` | 19 KB | ⚠️ Large — needs review |
| `course-preview-tab.tsx` | 19 KB | ⚠️ Large |
| `course-sections-editor.tsx` | 15 KB | ⚠️ Medium-large |

**Problems:**
- `curriculum-platform-editor.tsx` has at least 5 logical components in one file: `ElementEditor`, `TopicRow`, `CurriculumSkeleton`, `JsonImportPanel`, `CurriculumPlatformEditor`
- `course-create.page.tsx` has: `JsonImportModal`, `InstructorPicker`, `CourseCreatePage` mixed together
- Sub-components are not individually exportable or testable

---

## 2. Duplicate Logic

| Issue | Location |
|-------|----------|
| `invalidate()` defined inline inside every mutation component | `admin-overlay.tsx`, `courses-table.tsx` — pattern repeated, not shared |
| `coursesApi` vs `adminCoursesApi` — two different services with overlapping methods (`publish`, `unpublish`, `duplicate`, `delete`) | `courses.api.ts` vs `admin-courses.api.ts` |
| `CoursesTable` uses `coursesApi` (non-admin), `AdminOverlay` uses `adminCoursesApi` — inconsistent service usage | `courses-table.tsx`, `admin-overlay.tsx` |
| Duplicate card components: `admin-course-card.tsx`, `course-admin-card.tsx`, `course-card.tsx`, `platform-course-card.tsx` — 4 card files with unclear differentiation | `components/` |
| `unwrap()` / `unwrapItem()` / `unwrapList()` — different unwrap implementations in `course-sections-editor.tsx` and `admin-courses.api.ts` | Inconsistency |

---

## 3. Missing / Incomplete States

| State | Location | Severity |
|-------|----------|----------|
| No error state in `CourseSectionsEditor` | `course-sections-editor.tsx` | ❌ High |
| No error state in `CurriculumPlatformEditor` | `curriculum-platform-editor.tsx` | ❌ High |
| `CourseSectionsEditor` loads data via `useQuery` but `handleDataLoad` is defined but **never called** — data never initializes into state | `course-sections-editor.tsx` | ❌ Critical Bug |
| No empty state in `CoursesTable` when `data` is empty | `courses-table.tsx` | ⚠️ Medium |
| `courses-list.page.tsx` error state blocks entire page — better to show inline error with retry | `courses-list.page.tsx` | ⚠️ Medium |

---

## 4. React Patterns

| Issue | Location | Severity |
|-------|----------|----------|
| `CourseSectionsEditor` calls `useQuery` but ignores `data` — `handleDataLoad` is never wired to `onSuccess` or `useEffect` | `course-sections-editor.tsx` | ❌ Critical |
| `useEffect` in `CurriculumPlatformEditor` has missing dep `localTopics` — could cause stale closure | `curriculum-platform-editor.tsx` | ⚠️ Medium |
| `InstructorPicker` does two separate queries (`ADMIN`, `INSTRUCTOR`) on every render — no `staleTime` | `course-create.page.tsx` | ⚠️ Medium |
| No `React.memo` on `CourseCard`, `TopicRow` — entire list re-renders on any state change | `course-card.tsx`, `curriculum-platform-editor.tsx` | ⚠️ Medium |
| No `useCallback` on mutation handlers passed as props | Multiple locations | ⚠️ Low |
| `motion.div` animation on every card with `delay: index * 0.04` — causes layout jank on large lists | `course-card.tsx`, `curriculum-platform-editor.tsx` | ⚠️ Low |

---

## 5. Security / Safety

| Issue | Location | Severity |
|-------|----------|----------|
| `AdminOverlay` — Delete has NO confirmation dialog | `admin-overlay.tsx` | ❌ High |
| `AdminOverlay` — Publish/Unpublish has NO confirmation | `admin-overlay.tsx` | ❌ High |
| `CoursesTable` — Delete uses native `confirm()` — inconsistent with design system | `courses-table.tsx` | ⚠️ Medium |
| `CoursesTable` — Publish action has no loading state on button | `courses-table.tsx` | ⚠️ Medium |
| No rollback on failed optimistic updates anywhere in the module | Multiple | ⚠️ Medium |

---

## 6. Data Layer / React Query

| Issue | Location |
|-------|----------|
| `CoursesTable` invalidates `['courses']` — wrong key, should be `['admin', 'courses']` | `courses-table.tsx` |
| `CourseSectionsEditor` uses `adminApiClient` directly instead of `adminCoursesApi` service | `course-sections-editor.tsx` |
| No `staleTime` defined on any query — unnecessary refetches on focus | Global |
| No `retry` config — failures retry 3x by default including 404s | Global |
| Stats query has no error handling | `courses-list.page.tsx` |

---

## 7. UI / UX Inconsistencies

| Issue | Location |
|-------|----------|
| Loading spinner in `AdminOverlay` shows `'...'` text — not a proper spinner | `admin-overlay.tsx` |
| `CoursesTable` action buttons have no tooltips — icon-only with no accessibility | `courses-table.tsx` |
| `CourseCard` — `isFeatured` and `isNew` badges use `ms-auto` which can overlap each other | `course-card.tsx` |
| Mix of raw `<select>` and Shadcn `<Select>` across the same module | `course-create.page.tsx` vs `courses-list.page.tsx` |
| Mix of raw `<input>` and Shadcn `<Input>` in `course-create.page.tsx` | `course-create.page.tsx` |
| No `aria-label` on icon-only buttons throughout | Multiple |
| `InstructorPicker` dropdown has no keyboard navigation | `course-create.page.tsx` |

---

## 8. Folder Structure

```
components/
├── admin-course-card.tsx        ← unclear purpose vs course-admin-card.tsx
├── course-admin-card.tsx        ← unclear purpose
├── course-card.tsx              ← main card used in list
├── platform-course-card.tsx     ← frontend/platform card?
├── content-editor/              ← separate subfolder ✓
├── edit-tabs/                   ← separate subfolder ✓
```

**Problems:**
- 4 card-like components with confusing similar names — unclear which is authoritative
- `curriculum-platform-editor.tsx` and `course-sections-editor.tsx` seem to serve similar purposes (curriculum editing) — unclear why both exist
- No `index.ts` barrel export — imports are verbose

---

## 9. Accessibility

| Issue |
|-------|
| Icon-only buttons missing `aria-label` (`Edit`, `Delete`, `Publish` in table and overlay) |
| `AdminOverlay` buttons not reachable via keyboard (overlay only shows on hover) |
| No `role` or `aria-expanded` on collapsible sections in `CourseSectionsEditor` |
| Color-only state indicators (no text fallback for colorblind users) in `StateBadge` |

---

## 10. Summary — Priority Fixes

### 🔴 Critical (fix first)
1. `CourseSectionsEditor` — data never loads into state (hook bug)
2. `AdminOverlay` — Delete/Publish with no confirmation dialog
3. `CoursesTable` — wrong React Query invalidation key

### 🟡 High
4. Split `curriculum-platform-editor.tsx` into separate files
5. Split `course-create.page.tsx` into separate components
6. Consolidate duplicate card components
7. Unify service usage (`adminCoursesApi` only in admin)

### 🟢 Medium
8. Add `React.memo` to `CourseCard` and `TopicRow`
9. Add `staleTime` and `retry` config to queries
10. Replace all `confirm()` with Shadcn dialog
11. Add `aria-label` to all icon buttons
12. Standardize Shadcn `<Select>` / `<Input>` usage throughout
