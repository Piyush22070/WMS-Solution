# WMS Frontend – Angular 17

A clean, minimal Angular 17 frontend for the Workforce Management System.

## Prerequisites
- Node.js 18+ and npm
- Angular CLI 17: `npm install -g @angular/cli@17`

## Setup

```bash
cd wms-frontend
npm install
ng serve
```

Open http://localhost:4200

## Default Login
- Username: `admin`
- Password: `Admin@123`

## API Configuration
Edit `src/environments/environment.ts` to change the API URL:
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'   // ← change this
};
```

## Modules Included

| Module        | Features                                    |
|---------------|---------------------------------------------|
| Login         | JWT auth, session storage                   |
| Dashboard     | KPI cards, active announcements             |
| Employees     | List, search, add/edit/delete, status badge |
| Attendance    | Check-in/out, monthly view by employee      |
| Leaves        | Apply, cancel, approve/reject               |
| Departments   | CRUD (Admin only)                           |
| Projects      | CRUD with client link                       |
| Clients       | CRUD                                        |
| Allocations   | Assign employee to project, deactivate      |
| Announcements | Post, deactivate (Admin only)               |

## Role-Based Access
- **Admin** – full access
- **Manager** – create/edit employees, projects, clients, allocations; approve leaves
- **Employee** – view only; can apply/cancel own leaves; check-in/out

## Project Structure
```
src/app/
├── app.component.ts        # Root
├── app.config.ts           # Providers (HTTP, Router, Animations)
├── app.routes.ts           # Lazy-loaded routes
├── auth/
│   └── login.component.ts
├── dashboard/
├── employees/
├── attendance/
├── leaves/
├── departments/
├── projects/
├── clients/
├── allocations/
├── announcements/
└── shared/
    ├── components/layout.component.ts   # Sidebar + topbar shell
    ├── guards/auth.guard.ts
    ├── interceptors/auth.interceptor.ts
    ├── models/models.ts
    └── services/
        ├── auth.service.ts
        └── api.service.ts
```