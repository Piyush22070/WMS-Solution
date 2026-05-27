import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { Attendance, Employee } from '../shared/models/models';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h2>Attendance</h2><p>Check-in, check-out and monthly view</p></div>
    </div>

    <!-- Check in/out card -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><span class="card-title">Daily Attendance</span></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group" *ngIf="auth.isAdminOrManager()" style="min-width:180px">
          <label>Employee ID</label>
          <input type="number" [(ngModel)]="empId" placeholder="e.g. 1">
        </div>
        <div class="form-group" style="min-width:160px">
          <label>Work Mode</label>
          <select [(ngModel)]="workMode">
            <option value="WFO">WFO</option>
            <option value="WFH">WFH</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <button class="btn btn-primary" (click)="checkIn()" [disabled]="!canSubmitAttendance">
          <span class="material-icons">login</span> Check In
        </button>
        <button class="btn btn-outline" (click)="checkOut()" [disabled]="!canSubmitAttendance">
          <span class="material-icons">logout</span> Check Out
        </button>
      </div>
      <div *ngIf="message" class="alert" [ngClass]="messageType === 'success' ? 'alert-success' : 'alert-error'" style="margin-top:12px">
        {{ message }}
      </div>
    </div>

    <!-- Monthly view -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Monthly Attendance</span>
        <div style="display:flex;gap:8px;align-items:center">
          <input *ngIf="auth.isAdminOrManager()" type="number" [(ngModel)]="viewEmpId" placeholder="Emp ID" style="width:90px;padding:5px 8px;font-size:12px">
          <select [(ngModel)]="month" style="padding:5px 8px;font-size:12px;border:1px solid #ddd;border-radius:5px">
            <option *ngFor="let m of months; let i = index" [value]="i+1">{{ m }}</option>
          </select>
          <input type="number" [(ngModel)]="year" style="width:80px;padding:5px 8px;font-size:12px">
          <button class="btn btn-outline btn-sm" (click)="loadMonthly()">View</button>
        </div>
      </div>
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead>
            <tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Total Hours</th><th>Work Mode</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of attendance">
              <td>{{ a.attendanceDate | date:'mediumDate' }}</td>
              <td>{{ a.checkIn | date:'shortTime' }}</td>
              <td>{{ a.checkOut ? (a.checkOut | date:'shortTime') : '—' }}</td>
              <td>{{ a.totalHours ? (a.totalHours | number:'1.1-2') + 'h' : '—' }}</td>
              <td>
                <span class="badge badge-info">{{ a.workMode || '—' }}</span>
              </td>
            </tr>
            <tr *ngIf="attendance.length === 0">
              <td colspan="5" style="text-align:center;padding:32px;color:#bbb">No records found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  empId: number | null = null;
  workMode = 'WFO';
  message = '';
  messageType = '';
  viewEmpId: number | null = null;
  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  attendance: Attendance[] = [];
  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  constructor(private api: ApiService, public auth: AuthService) {}
  ngOnInit() {
    const employeeId = this.auth.getEmployeeId();
    if (employeeId) {
      this.empId = employeeId;
      this.viewEmpId = employeeId;
      if (!this.auth.isAdminOrManager()) {
        this.loadMonthly();
      }
    } else if (!this.auth.isAdminOrManager()) {
      this.auth.resolveEmployeeId().subscribe({
        next: (resolvedEmployeeId) => {
          if (resolvedEmployeeId) {
            this.empId = resolvedEmployeeId;
            this.viewEmpId = resolvedEmployeeId;
          }
          this.loadMonthly();
        },
        error: () => this.loadMonthly()
      });
    }
  }

  get canSubmitAttendance(): boolean {
    return this.auth.isAdminOrManager() ? !!this.empId : true;
  }

  checkIn() {
    const employeeId = this.auth.isAdminOrManager() ? this.empId : undefined;
    if (this.auth.isAdminOrManager() && !employeeId) return;
    this.api.checkIn(this.workMode, employeeId).subscribe({
      next: () => {
        this.message = 'Checked in successfully!';
        this.messageType = 'success';
        this.loadMonthly();
      },
      error: (e) => { this.message = e?.error?.error || e?.error?.message || e?.message || 'Check-in failed.'; this.messageType = 'error'; }
    });
  }

  checkOut() {
    const employeeId = this.auth.isAdminOrManager() ? this.empId : undefined;
    if (this.auth.isAdminOrManager() && !employeeId) return;
    this.api.checkOut(employeeId).subscribe({
      next: () => {
        this.message = 'Checked out successfully!';
        this.messageType = 'success';
        this.loadMonthly();
      },
      error: (e) => { this.message = e?.error?.error || e?.error?.message || e?.message || 'Check-out failed.'; this.messageType = 'error'; }
    });
  }

  loadMonthly() {
    if (this.auth.isAdminOrManager()) {
      if (!this.viewEmpId) return;
      this.api.getMonthlyAttendance(this.viewEmpId, this.month, this.year).subscribe({
        next: a => this.attendance = a,
        error: () => this.attendance = []
      });
      return;
    }

    this.api.getMyMonthlyAttendance(this.month, this.year).subscribe({
      next: a => this.attendance = a,
      error: () => this.attendance = []
    });
  }
}