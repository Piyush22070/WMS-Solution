import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { Announcement } from '../shared/models/models';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h2>Announcements</h2><p>Company-wide notices</p></div>
      <button *ngIf="auth.isAdmin()" class="btn btn-primary" (click)="openModal()">
        <span class="material-icons">add</span> New Announcement
      </button>
    </div>

    <div *ngFor="let a of announcements" class="card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="font-size:15px;font-weight:600;color:#1a1a1a">{{ a.title }}</span>
            <span class="badge" [ngClass]="a.isActive ? 'badge-success' : 'badge-neutral'">
              {{ a.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <p style="font-size:13px;color:#555;line-height:1.6">{{ a.message }}</p>
          <p class="text-muted" style="margin-top:8px">{{ a.createdOn | date:'medium' }}</p>
        </div>
        <button *ngIf="auth.isAdmin() && a.isActive" class="btn btn-danger btn-sm" style="margin-left:16px" (click)="deactivate(a)">
          Deactivate
        </button>
      </div>
    </div>

    <div *ngIf="announcements.length === 0" class="empty-state">
      <span class="material-icons">campaign</span>
      <p>No announcements yet</p>
    </div>

    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>New Announcement</h3>
          <button class="close-btn" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        <div class="modal-body">
          <div *ngIf="formError" class="alert alert-error">{{ formError }}</div>
          <div class="form-group" style="margin-bottom:12px">
            <label>Title *</label>
            <input [(ngModel)]="form.title" placeholder="Office Closed">
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label>Message *</label>
            <textarea [(ngModel)]="form.message" rows="4" placeholder="Announcement details..."></textarea>
          </div>
          <div class="form-group">
            <label>Created By (User ID) *</label>
            <input type="number" [(ngModel)]="form.createdBy" placeholder="1">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">
            {{ saving ? 'Posting...' : 'Post' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  showModal = false;
  form: Partial<Announcement> = {};
  formError = '';
  saving = false;

  constructor(public auth: AuthService, private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.getAnnouncements().subscribe({ next: a => this.announcements = a, error: () => {} }); }

  openModal() { this.form = { createdBy: 1 }; this.formError = ''; this.showModal = true; }
  closeModal() { this.showModal = false; }

  save() {
    if (!this.form.title || !this.form.message) { this.formError = 'Title and message are required.'; return; }
    this.saving = true;
    this.api.createAnnouncement(this.form as Announcement).subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: (e) => { this.saving = false; this.formError = e?.error?.message || 'Error posting.'; }
    });
  }

  deactivate(ann: Announcement) {
    if (!confirm('Deactivate this announcement?')) return;
    this.api.deactivateAnnouncement(ann.announcementId!).subscribe({ next: () => this.load(), error: () => {} });
  }
}