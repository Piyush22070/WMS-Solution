import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'employees', loadComponent: () => import('./employees/employees.component').then(m => m.EmployeesComponent) },
      { path: 'attendance', loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent) },
      { path: 'leaves', loadComponent: () => import('./leaves/leaves.component').then(m => m.LeavesComponent) },
      { path: 'departments', loadComponent: () => import('./departments/departments.component').then(m => m.DepartmentsComponent) },
      { path: 'projects', loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent) },
      { path: 'clients', loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent) },
      { path: 'allocations', loadComponent: () => import('./allocations/allocations.component').then(m => m.AllocationsComponent) },
      { path: 'announcements', loadComponent: () => import('./announcements/announcements.component').then(m => m.AnnouncementsComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];