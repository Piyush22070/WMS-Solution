import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { Project, Client } from '../shared/models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h2>Projects</h2><p>Track and manage projects</p></div>
      <button *ngIf="auth.isAdminOrManager()" class="btn btn-primary" (click)="openModal()">
        <span class="material-icons">add</span> New Project
      </button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Name</th><th>Client</th><th>Start Date</th><th>End Date</th><th>Status</th>
            <th *ngIf="auth.isAdminOrManager()">Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of projects">
            <td>{{ p.projectId }}</td>
            <td style="font-weight:500">{{ p.projectName }}</td>
            <td>{{ p.clientName || p.clientId || '—' }}</td>
            <td>{{ p.startDate | date:'mediumDate' }}</td>
            <td>{{ p.endDate | date:'mediumDate' }}</td>
            <td>
              <span class="badge" [ngClass]="p.status === 'Active' ? 'badge-success' : 'badge-neutral'">{{ p.status }}</span>
            </td>
            <td *ngIf="auth.isAdminOrManager()">
              <div style="display:flex;gap:6px">
                <button class="btn btn-outline btn-sm" (click)="openModal(p)">Edit</button>
                <button *ngIf="auth.isAdmin()" class="btn btn-danger btn-sm" (click)="deleteProj(p)">Delete</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="projects.length === 0">
            <td colspan="7" style="text-align:center;padding:32px;color:#bbb">No projects found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Edit Project' : 'New Project' }}</h3>
          <button class="close-btn" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        <div class="modal-body">
          <div *ngIf="formError" class="alert alert-error">{{ formError }}</div>
          <div class="form-grid">
            <div class="form-group full">
              <label>Project Name *</label>
              <input [(ngModel)]="form.projectName" placeholder="WMS Portal">
            </div>
            <div class="form-group full">
              <label>Client</label>
              <select [(ngModel)]="form.clientId">
                <option value="">No client</option>
                <option *ngFor="let c of clients" [value]="c.clientId">{{ c.clientName }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" [(ngModel)]="form.startDate">
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" [(ngModel)]="form.endDate">
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
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  clients: Client[] = [];
  showModal = false;
  editing: Project | null = null;
  form: Partial<Project> = {};
  formError = '';
  saving = false;

  constructor(public auth: AuthService, private api: ApiService) {}
  ngOnInit() {
    this.load();
    this.api.getClients().subscribe({ next: c => this.clients = c, error: () => {} });
  }

  load() { this.api.getProjects().subscribe({ next: p => this.projects = p, error: () => {} }); }

  openModal(proj?: Project) {
    this.editing = proj || null;
    this.form = proj ? { ...proj } : {};
    this.formError = '';
    this.showModal = true;
  }
  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.projectName) { this.formError = 'Project name is required.'; return; }
    this.saving = true;
    const call = this.editing?.projectId
      ? this.api.updateProject(this.editing.projectId, this.form as Project)
      : this.api.createProject(this.form as Project);
    call.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: (e) => { this.saving = false; this.formError = e?.error?.message || 'Error saving.'; }
    });
  }

  deleteProj(proj: Project) {
    if (!confirm(`Delete "${proj.projectName}"?`)) return;
    this.api.deleteProject(proj.projectId!).subscribe({ next: () => this.load(), error: () => {} });
  }
}