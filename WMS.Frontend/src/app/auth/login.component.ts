import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="material-icons">groups</span>
        </div>
        <h2>Welcome back</h2>
        <p>Sign in to your WMS account</p>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>

        <div class="form-group" style="margin-bottom:12px">
          <label>Username</label>
          <input type="text" [(ngModel)]="username" placeholder="admin" (keyup.enter)="login()">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="••••••••" (keyup.enter)="login()">
        </div>

        <button class="btn btn-primary" style="width:100%;justify-content:center" (click)="login()" [disabled]="loading">
          <span *ngIf="loading" class="material-icons" style="font-size:16px;animation:spin 1s linear infinite">refresh</span>
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>

        <p class="text-muted" style="margin-top:16px;text-align:center">
          Default: admin / Admin{{ '@' }}123
        </p>
      </div>
    </div>

    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => {
        this.error = e?.error?.message || 'Invalid credentials. Please try again.';
        this.loading = false;
      }
    });
  }
}