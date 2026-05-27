import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { Attendance, Employee } from '../shared/models/models';

interface EmployeeAttendance {
  empId: number;
  empName: string;
  attendanceRecords: Attendance[];
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h2>Attendance</h2><p>Monthly employee attendance view</p></div>
    </div>

    <!-- Admin view: All employees monthly attendance -->
    <div *ngIf="auth.isAdminOrManager()" class="card">
      <div class="card-header">
        <span class="card-title">All Employees Attendance</span>
        <div style="display:flex;gap:8px;align-items:center">
          <select [(ngModel)]="month" style="padding:5px 8px;font-size:12px;border:1px solid #ddd;border-radius:5px">
            <option *ngFor="let m of months; let i = index" [value]="i+1">{{ m }}</option>
          </select>
          <input type="number" [(ngModel)]="year" style="width:80px;padding:5px 8px;font-size:12px">
          <button class="btn btn-outline btn-sm" (click)="loadAllEmployeesAttendance()">Load</button>
        </div>
      </div>
      <div class="table-wrap" style="border:none;border-radius:0">
        <table>
          <thead>
            <tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Total Hours</th><th>Work Mode</th></tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let emp of employeeAttendanceList">
              <tr *ngFor="let a of emp.attendanceRecords; let first = first" [style.background-color]="first ? '#f9f9f9' : 'transparent'">
                <td *ngIf="first" [attr.rowspan]="emp.attendanceRecords.length" style="font-weight:bold;vertical-align:top;border-right:2px solid #ddd">
                  <div style="padding:8px 0">{{ emp.empName }}</div>
                </td>
                <td *ngIf="!first"></td>
                <td>{{ a.attendanceDate | date:'mediumDate' }}</td>
                <td>{{ a.checkIn | date:'shortTime' }}</td>
                <td>{{ a.checkOut ? (a.checkOut | date:'shortTime') : '—' }}</td>
                <td>{{ a.totalHours ? (a.totalHours | number:'1.1-2') + 'h' : '—' }}</td>
                <td>
                  <span class="badge badge-info">{{ a.workMode || '—' }}</span>
                </td>
              </tr>
            </ng-container>
            <tr *ngIf="employeeAttendanceList.length === 0">
              <td colspan="6" style="text-align:center;padding:32px;color:#bbb">No records found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Employee view: Daily check-in/out and personal attendance -->
    <div *ngIf="!auth.isAdminOrManager()">
      <!-- Check in/out card -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><span class="card-title">Daily Attendance</span></div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
          <div class="form-group" style="min-width:160px">
            <label>Work Mode</label>
            <select [(ngModel)]="workMode">
              <option value="WFO">WFO</option>
              <option value="WFH">WFH</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <button class="btn btn-primary" (click)="checkIn()">
            <span class="material-icons">login</span> Check In
          </button>
          <button class="btn btn-outline" (click)="checkOut()">
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
          <span class="card-title">My Monthly Attendance</span>
          <div style="display:flex;gap:8px;align-items:center">
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
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  empId: number | null = null;
  workMode = 'WFO';
  message = '';
  messageType = '';
  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  attendance: Attendance[] = [];
  employeeAttendanceList: EmployeeAttendance[] = [];
  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  constructor(private api: ApiService, public auth: AuthService) {}
  
  ngOnInit() {
    if (this.auth.isAdminOrManager()) {
      this.loadAllEmployeesAttendance();
    } else {
      const employeeId = this.auth.getEmployeeId();
      if (employeeId) {
        this.empId = employeeId;
        this.loadMonthly();
      } else {
        this.auth.resolveEmployeeId().subscribe({
          next: (resolvedEmployeeId) => {
            if (resolvedEmployeeId) {
              this.empId = resolvedEmployeeId;
            }
            this.loadMonthly();
          },
          error: () => this.loadMonthly()
        });
      }
    }
  }

  checkIn() {
    this.api.checkIn(this.workMode, this.empId || undefined).subscribe({
      next: () => {
        this.message = 'Checked in successfully!';
        this.messageType = 'success';
        this.loadMonthly();
      },
      error: (e) => { this.message = e?.error?.error || e?.error?.message || e?.message || 'Check-in failed.'; this.messageType = 'error'; }
    });
  }

  checkOut() {
    this.api.checkOut(this.empId || undefined).subscribe({
      next: () => {
        this.message = 'Checked out successfully!';
        this.messageType = 'success';
        this.loadMonthly();
      },
      error: (e) => { this.message = e?.error?.error || e?.error?.message || e?.message || 'Check-out failed.'; this.messageType = 'error'; }
    });
  }

  loadMonthly() {
    this.api.getMyMonthlyAttendance(this.month, this.year).subscribe({
      next: a => this.attendance = a,
      error: () => this.attendance = []
    });
  }

  loadAllEmployeesAttendance() {
    this.api.getEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.employeeAttendanceList = [];
        employees.forEach((emp: Employee) => {
          if (emp.employeeId) {
            this.api.getMonthlyAttendance(emp.employeeId, this.month, this.year).subscribe({
              next: (attendance) => {
                this.employeeAttendanceList.push({
                  empId: emp.employeeId!,
                  empName: `${emp.firstName} ${emp.lastName}`,
                  attendanceRecords: attendance
                });
                this.employeeAttendanceList.sort((a, b) => a.empId - b.empId);
              },
              error: () => {
                this.employeeAttendanceList.push({
                  empId: emp.employeeId!,
                  empName: `${emp.firstName} ${emp.lastName}`,
                  attendanceRecords: []
                });
                this.employeeAttendanceList.sort((a, b) => a.empId - b.empId);
              }
            });
          }
        });
      },
      error: () => this.employeeAttendanceList = []
    });
  }
}