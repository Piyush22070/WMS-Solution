import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-icon">
            <span class="material-icons" style="font-size:18px">groups</span>
          </div>
          <div>
            <div class="logo-text">WMS</div>
            <div class="logo-sub">Workforce Manager</div>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-label">Main</div>
          <a *ngFor="let item of visibleMainNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="sidebar-item">
            <span class="material-icons">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        </div>

        <div class="sidebar-section" *ngIf="visibleMgmtNav.length > 0">
          <div class="sidebar-section-label">Management</div>
          <a *ngFor="let item of visibleMgmtNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="sidebar-item">
            <span class="material-icons">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-item" (click)="logout()" style="cursor:pointer">
            <span class="material-icons">logout</span>
            Logout
          </div>
        </div>
      </aside>

      <!-- Main -->
      <div class="main-content">
        <div class="topbar">
          <span class="topbar-title">{{ pageTitle }}</span>
          <div class="topbar-right">
            <div class="topbar-user">
              <div class="avatar">{{ initials }}</div>
              <span>{{ username }}</span>
              <span class="badge badge-neutral">{{ role }}</span>
            </div>
          </div>
        </div>
        <div class="page-body">
          <router-outlet />
        </div>
      </div>
    </div>
  `
})
export class LayoutComponent {
  adminMainNav: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Employees', icon: 'badge', route: '/employees' },
    { label: 'Attendance', icon: 'schedule', route: '/attendance' },
    { label: 'Leaves', icon: 'event_busy', route: '/leaves' },
  ];

  adminMgmtNav: NavItem[] = [
    { label: 'Departments', icon: 'corporate_fare', route: '/departments' },
    { label: 'Projects', icon: 'folder_open', route: '/projects' },
    { label: 'Clients', icon: 'business', route: '/clients' },
    { label: 'Allocations', icon: 'assignment_ind', route: '/allocations' },
    { label: 'Announcements', icon: 'campaign', route: '/announcements' },
  ];

  employeeNav: NavItem[] = [
    { label: 'Attendance', icon: 'schedule', route: '/attendance' },
    { label: 'Leaves', icon: 'event_busy', route: '/leaves' },
    { label: 'Allocations', icon: 'assignment_ind', route: '/allocations' },
    { label: 'Announcements', icon: 'campaign', route: '/announcements' },
  ];

  get username() { return this.auth.getUsername(); }
  get role() { return this.auth.getRole(); }
  get initials() {
    return this.username.substring(0, 2).toUpperCase();
  }
  get isAdmin() { return this.auth.isAdmin(); }
  get visibleMainNav() { return this.isAdmin ? this.adminMainNav : this.employeeNav; }
  get visibleMgmtNav() { return this.isAdmin ? this.adminMgmtNav : []; }
  get pageTitle() { return 'Workforce Management System'; }

  constructor(private auth: AuthService) {}

  logout() { this.auth.logout(); }
}