# CyberLabs Admin Panel

**Modern admin dashboard for the CyberLabs platform** — built with React 19, Vite, TypeScript, TanStack Query, Zustand, and shadcn/ui.

---

## 🚀 Features

### ✅ Completed

- **Authentication** — Login with JWT, protected routes, admin-only access
- **Dashboard** — Analytics overview with stats, growth charts, engagement metrics, top content, and recent activity
- **Users Management** — List, search, filter, view details, change roles (USER ↔ ADMIN), suspend/unsuspend
- **Courses Management** — CRUD operations, publish/unpublish, filtering by difficulty and status
- **Labs Management** — Full CRUD, advanced filtering (difficulty, category, execution mode), flag answer security
- **Real-time Updates** — TanStack Query for caching and auto-refetch
- **Toast Notifications** — User feedback for all actions (Sonner)
- **Responsive Design** — Mobile-friendly tables and layouts
- **Type Safety** — Full TypeScript coverage with strict types

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite |
| **Routing** | React Router v7 |
| **State Management** | Zustand (auth + UI) |
| **Server State** | TanStack Query v5 |
| **HTTP Client** | Axios with interceptors |
| **Forms** | React Hook Form |
| **UI Components** | shadcn/ui (Radix UI) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Date Formatting** | date-fns |
| **Notifications** | Sonner |

---

## 📂 Project Structure

```
src/
├── core/
│   ├── api/
│   │   ├── client.ts              # Axios instance
│   │   ├── endpoints.ts           # API URLs
│   │   └── services/              # API service layer
│   ├── router/                    # React Router config
│   ├── store/                     # Zustand stores
│   └── types/                     # TypeScript types
├── features/
│   ├── auth/                      # Login
│   ├── dashboard/                 # Analytics dashboard
│   ├── users/                     # Users management
│   ├── courses/                   # Courses management
│   └── labs/                      # Labs management
├── shared/
│   ├── components/
│   │   ├── layout/                # Sidebar, Header, AdminLayout
│   │   ├── common/                # Reusable components
│   │   └── ui/                    # shadcn/ui components
│   └── constants/                 # Routes, etc.
└── App.tsx
```

---

## 🔧 Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

App runs on `http://localhost:5173`

### Build

```bash
npm run build
```

---

## 🔐 Authentication Flow

1. User submits login credentials
2. Backend returns `{ user, access_token }`
3. Token stored in cookie (`js-cookie`)
4. User stored in Zustand + localStorage
5. Axios interceptor attaches token to all requests
6. Protected routes check `isAuthenticated` + `role === 'ADMIN'`
7. 401 responses → auto-logout + redirect to `/login`

---

## 🎨 UI Components

- **shadcn/ui** — Headless Radix UI primitives styled with Tailwind
- **Lucide Icons** — 1000+ consistent icons
- **Responsive Tables** — Horizontal scroll on mobile
- **Loading States** — Skeleton loaders for all async data
- **Error Boundaries** — Graceful error handling

---

## 🔒 Security Features

### Flag Answer Protection

- **Backend-only storage** — Never exposed to frontend users
- **Admin-only display** — Masked input with show/hide toggle
- **Visual warnings** — Amber-themed UI alerts
- **Copy-to-clipboard** — Secure copy without exposing in DOM

### Role-Based Access

- Only `ADMIN` users can access the panel
- Non-admin users see "Access Denied" screen
- Backend enforces permissions on all endpoints

---

## 📝 API Endpoints

All endpoints are defined in `src/core/api/endpoints.ts`:

```typescript
API_ENDPOINTS = {
  AUTH: { LOGIN, ME, LOGOUT },
  ADMIN_USERS: { LIST, STATS, DETAIL, UPDATE_ROLE, SUSPEND, UNSUSPEND },
  ADMIN_COURSES: { LIST, STATS, DETAIL, CREATE, UPDATE, PUBLISH, UNPUBLISH, DELETE },
  ADMIN_LABS: { LIST, STATS, DETAIL, CREATE, UPDATE, PUBLISH, UNPUBLISH, DELETE },
  ADMIN_ANALYTICS: { OVERVIEW, GROWTH, ENGAGEMENT, TOP_CONTENT, RECENT_ACTIVITY },
}
```

---

## 🚧 Future Enhancements

- [ ] Course/Lab edit pages (currently create-only)
- [ ] Bulk actions (multi-select + batch delete/publish)
- [ ] Advanced analytics (charts with Recharts/Chart.js)
- [ ] User activity logs
- [ ] File upload for course/lab images
- [ ] Rich text editor for descriptions
- [ ] Dark mode toggle (system preference detection)
- [ ] Internationalization (i18n)

---

## 📄 License

MIT

---

**Built with ❤️ for the CyberLabs platform**
