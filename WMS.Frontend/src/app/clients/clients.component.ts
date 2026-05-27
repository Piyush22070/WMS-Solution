import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { Client } from '../shared/models/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h2>Clients</h2><p>Manage client records</p></div>
      <button *ngIf="auth.isAdminOrManager()" class="btn btn-primary" (click)="openModal()">
        <span class="material-icons">add</span> Add Client
      </button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Name</th><th>Location</th><th>Phone</th><th>Address</th>
            <th *ngIf="auth.isAdminOrManager()">Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of clients">
            <td>{{ c.clientId }}</td>
            <td style="font-weight:500">{{ c.clientName }}</td>
            <td>{{ c.clientLocation || '—' }}</td>
            <td>{{ c.clientPhoneNumber || '—' }}</td>
            <td>{{ c.clientAddress || '—' }}</td>
            <td *ngIf="auth.isAdminOrManager()">
              <div style="display:flex;gap:6px">
                <button class="btn btn-outline btn-sm" (click)="openModal(c)">Edit</button>
                <button *ngIf="auth.isAdmin()" class="btn btn-danger btn-sm" (click)="deleteClient(c)">Delete</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="clients.length === 0">
            <td colspan="6" style="text-align:center;padding:32px;color:#bbb">No clients found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Edit Client' : 'Add Client' }}</h3>
          <button class="close-btn" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        <div class="modal-body">
          <div *ngIf="formError" class="alert alert-error">{{ formError }}</div>
          <div class="form-grid">
            <div class="form-group full">
              <label>Client Name *</label>
              <input [(ngModel)]="form.clientName" placeholder="Acme Corp">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="number" [(ngModel)]="form.clientPhoneNumber" placeholder="9876543210">
            </div>
            <div class="form-group">
              <label>Location</label>
              <input [(ngModel)]="form.clientLocation" placeholder="New York">
            </div>
            <div class="form-group full">
              <label>Address</label>
              <textarea [(ngModel)]="form.clientAddress" placeholder="123 Main St, New York"></textarea>
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
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  showModal = false;
  editing: Client | null = null;
  form: Partial<Client> = {};
  formError = '';
  saving = false;

  constructor(public auth: AuthService, private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.getClients().subscribe({ next: c => this.clients = c, error: () => {} }); }

  openModal(client?: Client) {
    this.editing = client || null;
    this.form = client ? { ...client } : {};
    this.formError = '';
    this.showModal = true;
  }
  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.clientName) { this.formError = 'Client name is required.'; return; }
    this.saving = true;
    const call = this.editing?.clientId
      ? this.api.updateClient(this.editing.clientId, this.form as Client)
      : this.api.createClient(this.form as Client);
    call.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: (e) => { this.saving = false; this.formError = e?.error?.message || 'Error saving.'; }
    });
  }

  deleteClient(client: Client) {
    if (!confirm(`Delete "${client.clientName}"?`)) return;
    this.api.deleteClient(client.clientId!).subscribe({ next: () => this.load(), error: () => {} });
  }
}