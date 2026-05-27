import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { Allocation, Employee, Project } from '../shared/models/models';

@Component({
  selector: 'app-allocations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h2>Allocations</h2><p>Assign employees to projects</p></div>
      <button *ngIf="auth.isAdminOrManager()" class="btn btn-primary" (click)="openModal()">
        <span class="material-icons">add</span> Allocate
      </button>
    </div>

    <!-- Filter -->
    <div class="card" style="margin-bottom:16px;padding:14px 16px">
      <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
        <div class="form-group" style="min-width:240px;flex:1">
          <label>Search</label>
          <input type="text" [(ngModel)]="searchText" placeholder="Project, employee, creator" (input)="applyFilters()">
        </div>
        <div class="form-group" style="min-width:180px">
          <label>View by Project ID</label>
          <input type="number" [(ngModel)]="filterProjectId" placeholder="Project ID" (input)="applyFilters()">
        </div>
        <button class="btn btn-outline" (click)="loadVisible()">Load</button>
        <button class="btn btn-outline" (click)="clearFilters()">Clear</button>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Employee</th><th>Project</th><th>Assigned On</th><th>Created By</th><th>Status</th>
            <th *ngIf="auth.isAdminOrManager()">Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of allocations">
            <td>{{ a.allocationId }}</td>
            <td style="font-weight:500">{{ a.employeeName || a.empId }}</td>
            <td>{{ a.projectName || a.projectId }}</td>
            <td>{{ a.assignedOn | date:'mediumDate' }}</td>
            <td>{{ a.createdBy }}</td>
            <td>
              <span class="badge" [ngClass]="a.status ? 'badge-success' : 'badge-neutral'">
                {{ a.status ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td *ngIf="auth.isAdminOrManager()">
              <button *ngIf="a.status" class="btn btn-danger btn-sm" (click)="deactivate(a)">Deactivate</button>
            </td>
          </tr>
          <tr *ngIf="allocations.length === 0">
            <td colspan="7" style="text-align:center;padding:32px;color:#bbb">No allocations found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" style="width:440px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Allocate Employee</h3>
          <button class="close-btn" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        <div class="modal-body">
          <div *ngIf="formError" class="alert alert-error">{{ formError }}</div>
          <div class="form-grid">
            <div class="form-group">
              <label>Employee ID *</label>
              <input type="number" [(ngModel)]="form.empId" placeholder="1">
            </div>
            <div class="form-group">
              <label>Project *</label>
              <select [(ngModel)]="form.projectId">
                <option value="">Select project</option>
                <option *ngFor="let p of projects" [value]="p.projectId">{{ p.projectName }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Assigned On *</label>
              <input type="date" [(ngModel)]="form.assignedOn">
            </div>
            <div class="form-group">
              <label>Created By *</label>
              <input [(ngModel)]="form.createdBy" placeholder="admin">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Allocate' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AllocationsComponent implements OnInit {
  allocations: Allocation[] = [];
  allAllocations: Allocation[] = [];
  projects: Project[] = [];
  showModal = false;
  form: Partial<Allocation> = {};
  formError = '';
  saving = false;
  filterProjectId: number | null = null;
  searchText = '';

  constructor(public auth: AuthService, private api: ApiService) {}
  ngOnInit() {
    this.api.getProjects().subscribe({ next: p => this.projects = p, error: () => {} });
    this.loadAll();
  }

  loadAll() {
    this.api.getAllocations().subscribe({ next: a => { this.allAllocations = a; this.applyFilters(); }, error: () => {} });
  }

  applyFilters() {
    const projectId = this.filterProjectId;
    const search = this.searchText.trim().toLowerCase();

    this.allocations = this.allAllocations.filter(a => {
      const projectMatch = projectId ? a.projectId === projectId : true;
      const searchMatch = search
        ? `${a.employeeName || ''} ${a.projectName || ''} ${a.createdBy || ''}`.toLowerCase().includes(search)
        : true;
      return projectMatch && searchMatch;
    });
  }

  loadVisible() {
    if (this.filterProjectId) {
      this.api.getProjectAllocations(this.filterProjectId).subscribe({
        next: a => { this.allAllocations = a; this.applyFilters(); },
        error: () => {}
      });
      return;
    }

    this.loadAll();
  }

  clearFilters() {
    this.filterProjectId = null;
    this.searchText = '';
    this.loadAll();
  }

  openModal() {
    this.form = { createdBy: this.auth.getUsername(), assignedOn: new Date().toISOString().split('T')[0] };
    this.formError = '';
    this.showModal = true;
  }
  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.empId || !this.form.projectId || !this.form.assignedOn) {
      this.formError = 'Please fill all required fields.'; return;
    }
    this.saving = true;
    this.api.createAllocation(this.form as Allocation).subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadAll();
      },
      error: (e) => { this.saving = false; this.formError = e?.error?.message || 'Error saving.'; }
    });
  }

  deactivate(alloc: Allocation) {
    if (!confirm('Deactivate this allocation?')) return;
    this.api.deactivateAllocation(alloc.allocationId!, this.auth.getUsername()).subscribe({
      next: () => this.loadAll(),
      error: () => {}
    });
  }
}