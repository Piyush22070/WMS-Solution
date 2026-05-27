import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../shared/services/api.service';
import { DashboardSummary, Announcement } from '../shared/models/models';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Dashboard</h2>
        <p>Overview of your workforce</p>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon"><span class="material-icons">badge</span></div>
        <div>
          <div class="kpi-value">{{ summary?.totalEmployees ?? '—' }}</div>
          <div class="kpi-label">Total Employees</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon"><span class="material-icons">folder_open</span></div>
        <div>
          <div class="kpi-value">{{ summary?.activeProjects ?? '—' }}</div>
          <div class="kpi-label">Active Projects</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon"><span class="material-icons">event_busy</span></div>
        <div>
          <div class="kpi-value">{{ summary?.pendingLeaves ?? '—' }}</div>
          <div class="kpi-label">Pending Leaves</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon"><span class="material-icons">how_to_reg</span></div>
        <div>
          <div class="kpi-value">{{ summary?.todayAttendance ?? '—' }}</div>
          <div class="kpi-label">Today's Attendance</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon"><span class="material-icons">schedule</span></div>
        <div>
          <div class="kpi-value">{{ summary?.totalWorkingHours ? (summary?.totalWorkingHours | number:'1.1-2') + 'h' : '—' }}</div>
          <div class="kpi-label">Total Working Hours</div>
        </div>
      </div>
    </div>

    <!-- Announcements -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Active Announcements</span>
        <span class="material-icons" style="color:#bbb;font-size:20px">campaign</span>
      </div>
      <div *ngIf="announcements.length === 0" class="empty-state">
        <span class="material-icons">campaign</span>
        <p>No active announcements</p>
      </div>
      <div *ngFor="let ann of announcements" style="padding:12px 0;border-bottom:1px solid #f0f0f0">
        <div style="font-weight:500;font-size:13px;color:#1a1a1a;margin-bottom:4px">{{ ann.title }}</div>
        <div style="font-size:12px;color:#666">{{ ann.message }}</div>
        <div class="text-muted" style="margin-top:4px">{{ ann.createdOn | date:'mediumDate' }}</div>
      </div>
    </div>

    <div *ngIf="auth.isAdminOrManager()" class="card" style="margin-top:20px">
      <div class="card-header">
        <span class="card-title">Employee Attendance Summary</span>
        <span class="material-icons" style="color:#bbb;font-size:20px">groups</span>
      </div>
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Working Days</th>
              <th>Working Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of summary?.employeeAttendance || []">
              <td>{{ row.employeeName }}</td>
              <td>{{ row.workingDays }}</td>
              <td>{{ row.workingHours | number:'1.1-2' }}h</td>
            </tr>
            <tr *ngIf="!summary?.employeeAttendance?.length">
              <td colspan="3" style="text-align:center;padding:32px;color:#bbb">No working attendance found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  announcements: Announcement[] = [];

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() {
    if (this.auth.isAdminOrManager()) {
      this.api.getDashboard().subscribe({ next: s => this.summary = s, error: () => {} });
    }
    this.api.getActiveAnnouncements().subscribe({ next: a => this.announcements = a, error: () => {} });
  }
}