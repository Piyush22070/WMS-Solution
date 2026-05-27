import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { Department } from '../shared/models/models';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h2>Departments</h2><p>Manage company departments</p></div>
      <button *ngIf="auth.isAdmin()" class="btn btn-primary" (click)="openModal()">
        <span class="material-icons">add</span> Add Department
      </button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Name</th><th>Description</th><th *ngIf="auth.isAdmin()">Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of departments">
            <td>{{ d.departmentId }}</td>
            <td style="font-weight:500">{{ d.departmentName }}</td>
            <td>{{ d.description || '—' }}</td>
            <td *ngIf="auth.isAdmin()">
              <div style="display:flex;gap:6px">
                <button class="btn btn-outline btn-sm" (click)="openModal(d)">Edit</button>
                <button class="btn btn-danger btn-sm" (click)="deleteDept(d)">Delete</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="departments.length === 0">
            <td colspan="4" style="text-align:center;padding:32px;color:#bbb">No departments found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" style="width:400px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Edit Department' : 'Add Department' }}</h3>
          <button class="close-btn" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        <div class="modal-body">
          <div *ngIf="formError" class="alert alert-error">{{ formError }}</div>
          <div class="form-group" style="margin-bottom:12px">
            <label>Department Name *</label>
            <input [(ngModel)]="form.departmentName" placeholder="Engineering">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="form.description" placeholder="Optional description"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">
            {{ saving ? 'Saving...' : (editing ? 'Update' : 'Create') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  showModal = false;
  editing: Department | null = null;
  form: Partial<Department> = {};
  formError = '';
  saving = false;

  constructor(public auth: AuthService, private api: ApiService) {}
  ngOnInit() { this.load(); }

  load() { this.api.getDepartments().subscribe({ next: d => this.departments = d, error: () => {} }); }

  openModal(dept?: Department) {
    this.editing = dept || null;
    this.form = dept ? { ...dept } : {};
    this.formError = '';
    this.showModal = true;
  }
  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.departmentName) { this.formError = 'Department name is required.'; return; }
    this.saving = true;
    const call = this.editing?.departmentId
      ? this.api.updateDepartment(this.editing.departmentId, this.form as Department)
      : this.api.createDepartment(this.form as Department);
    call.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: (e) => { this.saving = false; this.formError = e?.error?.message || 'Error saving.'; }
    });
  }

  deleteDept(dept: Department) {
    if (!confirm(`Delete "${dept.departmentName}"?`)) return;
    this.api.deleteDepartment(dept.departmentId!).subscribe({ next: () => this.load(), error: () => {} });
  }
}