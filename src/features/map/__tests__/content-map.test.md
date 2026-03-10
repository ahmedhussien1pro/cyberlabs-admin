# Content Map — Test Cases & Use Cases

## UC-1: Load & Display Paths
**Precondition:** Backend is up, learning paths exist in DB.  
**Steps:**
1. Navigate to `/admin/content-map`.
2. Sidebar should show a skeleton loader, then a list of paths.
3. Each path card shows title, `totalCourses`, `totalLabs`, `estimatedHours`, and publish status icon.

**Expected:** Paths load within 2s. `No paths found` shown only when list is empty.

---

## UC-2: Select a Path → Load Course Modules
**Steps:**
1. Click any path in the sidebar.
2. Right panel shows spinner, then list of `COURSE` type modules sorted by `order`.
3. Header shows module count.

**Expected:**
- `localModules` state is populated via `useEffect` (fixed from broken `useCallback`).
- Only `type === 'COURSE'` modules with a valid `.course` relation appear.
- Non-course modules (LAB, QUIZ, PROJECT) are filtered out.

---

## UC-3: Drag-and-Drop — Reorder Course Modules
**Steps:**
1. Select a path with ≥2 course modules.
2. Drag module #1 onto module #3.
3. Module order updates optimistically in the UI.
4. `PATCH /api/v1/admin/paths/:id/modules/reorder` is called with new order array.

**Expected:**
- On success: order persists after page refresh.
- On error: modules revert to original order, toast `reorder.moduleError` shown.

---

## UC-4: Expand Course → View Linked Labs
**Steps:**
1. Click the chevron on a course card.
2. Linked labs section animates open.
3. `GET /api/v1/admin/courses/:id/labs` is fetched (cached by React Query).

**Expected:**
- Labs listed with title, difficulty badge, publish status icon.
- `No labs linked yet` shown if empty.
- Consecutive expand/collapse does NOT re-fetch (React Query cache hit).

---

## UC-5: Drag-and-Drop — Reorder Labs within Course
**Steps:**
1. Expand a course with ≥2 labs.
2. Drag lab #1 to position #2.
3. `PATCH /api/v1/admin/courses/:id/labs/reorder` called.

**Expected:**
- Optimistic update applied immediately.
- On error: reverts, shows `labsSection.reorderError` toast.

---

## UC-6: Link Lab to Course via Modal
**Steps:**
1. Click "Link Lab" button inside any expanded course.
2. Modal opens with lab search input focused.
3. Type in search box → debounced fetch from `GET /api/v1/admin/labs?search=...&limit=50`.
4. Click an unlinked lab.

**Expected:**
- Already-linked labs shown in green with "✓ Linked" badge, non-clickable.
- On success: modal stays open, lab appears immediately in the course's labs list (query invalidated).
- Toast shows `linkModal.linkSuccess`.

---

## UC-7: Unlink Lab from Course
**Steps:**
1. Expand a course with at least 1 lab.
2. Hover the lab row → action buttons appear.
3. Click the red ✕ button.

**Expected:**
- `DELETE /api/v1/admin/courses/:courseId/labs/:labId` called.
- Lab disappears from list.
- Toast shows `labsSection.unlinkSuccess`.
- On error: toast shows `labsSection.unlinkError`.

---

## UC-8: i18n — Switch Language
**Steps:**
1. Switch language to Arabic via the header language toggle.
2. Navigate to Content Map.

**Expected:**
- All labels use `contentMap` namespace keys from `public/locales/ar/contentMap.json`.
- Header shows `خريطة المحتوى`.
- Sidebar search placeholder shows `ابحث في المسارات...`.
- Difficulty badges show Arabic labels.
- No hardcoded English strings visible.

---

## UC-9: Empty States
| Scenario | Expected UI |
|---|---|
| No paths in DB | Sidebar: `sidebar.noPathsFound` |
| No paths match search | Sidebar: `sidebar.noPathsFound` |
| Path selected but has no COURSE modules | Main: `detail.noModulesTitle` + Add Modules button |
| Course expanded but has no linked labs | `labsSection.noLabsLinked` |
| Lab search returns 0 results | `linkModal.noLabsFound` |

---

## UC-10: Backend 500 Error (API Down)
**Steps:**
1. Backend returns 500 on `GET /api/v1/admin/paths?limit=100`.

**Expected:**
- React Query retries 3 times (default).
- After retries: sidebar shows no paths (empty state), no crash.
- Error boundary does NOT trigger (component handles the failed state gracefully).
