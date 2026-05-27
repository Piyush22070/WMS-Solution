import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { Leave } from '../shared/models/models';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h2>Leaves</h2><p>Apply and manage leave requests</p></div>
      <button class="btn btn-primary" (click)="openModal()">
        <span class="material-icons">add</span> Apply Leave
      </button>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:4px;margin-bottom:16px;border-bottom:1px solid #e8e8e8;padding-bottom:0">
      <button class="btn btn-outline btn-sm" [style.border-bottom]="tab==='my'?'2px solid #1a1a1a':''" (click)="tab='my';loadMy()">My Leaves</button>
      <button *ngIf="auth.isAdminOrManager()" class="btn btn-outline btn-sm" [style.border-bottom]="tab==='all'?'2px solid #1a1a1a':''" (click)="tab='all';loadAll()">All Leaves</button>
      <button *ngIf="auth.isAdminOrManager()" class="btn btn-outline btn-sm" [style.border-bottom]="tab==='pending'?'2px solid #1a1a1a':''" (click)="tab='pending';loadPending()">Pending Approvals</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Emp ID</th><th>Type</th><th>From</th><th>To</th>
            <th>Reason</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let l of leaves">
            <td>{{ l.leaveId }}</td>
            <td>{{ l.empId }}</td>
            <td>{{ l.leaveType }}</td>
            <td>{{ l.fromDate | date:'mediumDate' }}</td>
            <td>{{ l.toDate | date:'mediumDate' }}</td>
            <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ l.reason || '—' }}</td>
            <td>
              <span class="badge"
                [ngClass]="{
                  'badge-warning': l.status === 'Pending',
                  'badge-success': l.status === 'Approved',
                  'badge-danger': l.status === 'Rejected',
                  'badge-neutral': l.status === 'Cancelled'
                }">{{ l.status }}</span>
            </td>
            <td>
              <div style="display:flex;gap:6px">
                <ng-container *ngIf="auth.isAdminOrManager() && l.status === 'Pending'">
                  <button class="btn btn-outline btn-sm" style="color:#1a7a46;border-color:#b8e8cf" (click)="approve(l, 'Approved')">Approve</button>
                  <button class="btn btn-outline btn-sm" style="color:#c0392b;border-color:#f5ccc8" (click)="approve(l, 'Rejected')">Reject</button>
                </ng-container>
                <button *ngIf="l.status === 'Pending'" class="btn btn-danger btn-sm" (click)="cancel(l)">Cancel</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="leaves.length === 0">
            <td colspan="8" style="text-align:center;padding:32px;color:#bbb">No leave records found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Apply for Leave</h3>
          <button class="close-btn" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        <div class="modal-body">
          <div *ngIf="formError" class="alert alert-error">{{ formError }}</div>
          <div class="form-grid">
            <div class="form-group">
              <label>Leave Type *</label>
              <select [(ngModel)]="form.leaveType">
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
                <option value="Earned">Earned</option>
              </select>
            </div>
            <div class="form-group">
              <label>From Date *</label>
              <input type="date" [(ngModel)]="form.fromDate">
            </div>
            <div class="form-group">
              <label>To Date *</label>
              <input type="date" [(ngModel)]="form.toDate">
            </div>
            <div class="form-group full">
              <label>Reason</label>
              <textarea [(ngModel)]="form.reason" placeholder="Reason for leave..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">
            {{ saving ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class LeavesComponent implements OnInit {
  leaves: Leave[] = [];
  tab = 'my';
  showModal = false;
  form: Partial<Leave> = { leaveType: 'Sick' };
  formError = '';
  saving = false;

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.loadMy();
  }

  loadMy() {
    this.api.getMyLeaves().subscribe({ next: l => this.leaves = l, error: () => {} });
  }
  loadAll() { this.api.getLeaves().subscribe({ next: l => this.leaves = l, error: () => {} }); }
  loadPending() { this.api.getPendingLeaves().subscribe({ next: l => this.leaves = l, error: () => {} }); }

  openModal() { this.form = { leaveType: 'Sick' }; this.formError = ''; this.showModal = true; }
  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.fromDate || !this.form.toDate) {
      this.formError = 'Please fill all required fields.'; return;
    }
    this.saving = true;
    const payload = { ...this.form } as Leave;
    this.api.applyLeave(payload).subscribe({
      next: () => { this.saving = false; this.closeModal(); this.loadMy(); },
      error: (e) => { this.saving = false; this.formError = e?.error?.message || 'Failed to apply leave.'; }
    });
  }

  approve(leave: Leave, status: string) {
    const approvedBy = this.auth.getEmployeeId() || 1;
    this.api.approveLeave(leave.leaveId!, status, approvedBy).subscribe({
      next: () => { if (this.tab === 'pending') this.loadPending(); else this.loadAll(); },
      error: () => {}
    });
  }

  cancel(leave: Leave) {
    if (!confirm('Cancel this leave?')) return;
    this.api.cancelLeave(leave.leaveId!).subscribe({ next: () => this.loadMy(), error: () => {} });
  }
}