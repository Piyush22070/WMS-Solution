import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { Employee, Department, Role } from '../shared/models/models';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Employees</h2>
        <p>Manage all employee records</p>
      </div>
      <button *ngIf="auth.isAdmin()" class="btn btn-primary" (click)="openModal()">
        <span class="material-icons">add</span> Add Employee
      </button>
    </div>

    <!-- Search -->
    <div class="card" style="margin-bottom:16px;padding:14px 16px">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div class="search-bar" style="flex:1;min-width:180px">
          <span class="material-icons">search</span>
          <input type="text" [(ngModel)]="searchName" placeholder="Search by name..." (input)="onSearch()">
        </div>
        <select [(ngModel)]="filterDept" (change)="onSearch()" style="padding:7px 10px;border:1px solid #ddd;border-radius:7px;font-size:13px">
          <option value="">All Departments</option>
          <option *ngFor="let d of departments" [value]="d.departmentId">{{ d.departmentName }}</option>
        </select>
        <select [(ngModel)]="filterRole" (change)="onSearch()" style="padding:7px 10px;border:1px solid #ddd;border-radius:7px;font-size:13px">
          <option value="">All Roles</option>
          <option *ngFor="let r of roles" [value]="r.roleId">{{ r.roleName }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Email</th><th>Phone</th>
            <th>Department</th><th>Role</th><th>Status</th>
            <th *ngIf="auth.isAdmin()">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of employees">
            <td>{{ e.employeeId }}</td>
            <td style="font-weight:500">{{ e.firstName }} {{ e.lastName }}</td>
            <td>{{ e.email }}</td>
            <td>{{ e.phoneNumber }}</td>
            <td>{{ e.departmentName || e.departmentId }}</td>
            <td>{{ e.roleName || e.roleId }}</td>
            <td>
              <span class="badge" [ngClass]="e.status === 'Active' ? 'badge-success' : 'badge-neutral'">
                {{ e.status || 'Active' }}
              </span>
            </td>
            <td *ngIf="auth.isAdmin()">
              <div style="display:flex;gap:6px">
                <button class="btn btn-outline btn-sm" (click)="openModal(e)">Edit</button>
                <button *ngIf="auth.isAdmin()" class="btn btn-danger btn-sm" (click)="deleteEmp(e)">Delete</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="employees.length === 0">
            <td [attr.colspan]="auth.isAdmin() ? 8 : 7" style="text-align:center;padding:32px;color:#bbb">
              No employees found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Edit Employee' : 'Add Employee' }}</h3>
          <button class="close-btn" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        <div class="modal-body">
          <div *ngIf="formError" class="alert alert-error">{{ formError }}</div>
          <div class="form-grid">
            <div class="form-group full" *ngIf="!editing">
              <label>Username *</label>
              <input [(ngModel)]="form.username" placeholder="john.doe">
            </div>
            <div class="form-group full" *ngIf="!editing">
              <label>Password *</label>
              <input [(ngModel)]="form.password" type="password" placeholder="Enter a temporary password">
            </div>
            <div class="form-group">
              <label>First Name *</label>
              <input [(ngModel)]="form.firstName" placeholder="John">
            </div>
            <div class="form-group">
              <label>Last Name *</label>
              <input [(ngModel)]="form.lastName" placeholder="Doe">
            </div>
            <div class="form-group full">
              <label>Email *</label>
              <input [(ngModel)]="form.email" type="email" placeholder="john.doe@company.com">
            </div>
            <div class="form-group">
              <label>Phone *</label>
              <input [(ngModel)]="form.phoneNumber" placeholder="9876543210">
            </div>
            <div class="form-group">
              <label>Gender *</label>
              <select [(ngModel)]="form.gender">
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date of Birth *</label>
              <input [(ngModel)]="form.dob" type="date">
            </div>
            <div class="form-group">
              <label>Date of Joining *</label>
              <input [(ngModel)]="form.doj" type="date">
            </div>
            <div class="form-group">
              <label>Department *</label>
              <select [(ngModel)]="form.departmentId">
                <option value="">Select</option>
                <option *ngFor="let d of departments" [value]="d.departmentId">{{ d.departmentName }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Role *</label>
              <select [(ngModel)]="form.roleId">
                <option value="">Select</option>
                <option *ngFor="let r of roles" [value]="r.roleId">{{ r.roleName }}</option>
              </select>
            </div>
            <div *ngIf="!editing" class="form-group full" style="font-size:12px;color:#777;margin-top:-4px">
              This username and password will be used for employee login.
            </div>
            <div class="form-group" *ngIf="editing">
              <label>Status</label>
              <select [(ngModel)]="form.status">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
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
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  departments: Department[] = [];
  roles: Role[] = [];
  showModal = false;
  editing: Employee | null = null;
  form: Partial<Employee> = {};
  formError = '';
  saving = false;
  searchName = '';
  filterDept: any = '';
  filterRole: any = '';

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.loadAll();
    this.api.getDepartments().subscribe({ next: d => this.departments = d, error: () => {} });
    this.api.getRoles().subscribe({ next: r => this.roles = r, error: () => {} });
  }

  loadAll() {
    this.api.getEmployees().subscribe({ next: e => this.employees = e, error: () => {} });
  }

  onSearch() {
    this.api.searchEmployees({
      name: this.searchName || undefined,
      departmentId: this.filterDept || undefined,
      roleId: this.filterRole || undefined
    }).subscribe({ next: e => this.employees = e, error: () => this.loadAll() });
  }

  openModal(emp?: Employee) {
    this.editing = emp || null;
    this.form = emp ? { ...emp } : { status: 'Active', gender: '' };
    this.formError = '';
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.departmentId || !this.form.roleId) {
      this.formError = 'Please fill in all required fields.'; return;
    }

    if (!this.editing && (!this.form.username || !this.form.password)) {
      this.formError = 'Username and password are required for new employees.';
      return;
    }

    this.saving = true;
    const payload = this.form as Employee;
    if (this.editing?.employeeId) {
      this.api.updateEmployee(this.editing.employeeId, payload).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadAll(); },
        error: (e) => { this.saving = false; this.formError = e?.error?.message || 'An error occurred.'; }
      });
      return;
    }

    this.api.createEmployee(payload).subscribe({
      next: (createdEmployee) => {
        const username = (this.form.username || '').trim();
        const password = this.form.password || '';
        const roleId = Number(this.form.roleId);

        this.api.registerUser({ username, password, roleId, employeeId: createdEmployee.employeeId }).subscribe({
          next: () => {
            this.saving = false;
            this.closeModal();
            this.loadAll();
          },
          error: (e) => {
            const message = e?.error?.error || e?.error?.message || 'Unable to create login credentials.';
            if (createdEmployee?.employeeId) {
              this.api.deleteEmployee(createdEmployee.employeeId).subscribe({ next: () => {}, error: () => {} });
            }
            this.saving = false;
            this.formError = message;
          }
        });
      },
      error: (e) => { this.saving = false; this.formError = e?.error?.message || 'An error occurred.'; }
    });
  }

  deleteEmp(emp: Employee) {
    if (!confirm(`Delete ${emp.firstName} ${emp.lastName}?`)) return;
    this.api.deleteEmployee(emp.employeeId!).subscribe({ next: () => this.loadAll(), error: () => {} });
  }
}