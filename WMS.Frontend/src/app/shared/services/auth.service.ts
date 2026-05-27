import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'wms_token';
  private userKey = 'wms_user';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/Auth/login`, credentials).pipe(
      tap(res => {
        sessionStorage.setItem(this.tokenKey, res.token);
        sessionStorage.setItem(this.userKey, JSON.stringify(res));
        this.currentUserSubject.next(res);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string {
    return this.currentUserSubject.value?.role || '';
  }

  getUsername(): string {
    return this.currentUserSubject.value?.username || '';
  }

  getEmployeeId(): number | null {
    const employeeId = this.currentUserSubject.value?.employeeId;
    return typeof employeeId === 'number' ? employeeId : null;
  }

  resolveEmployeeId(): Observable<number | null> {
    return this.http.get<{ employeeId: number | null }>(`${this.baseUrl}/Auth/me/employee-id`).pipe(
      tap(result => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser && typeof result.employeeId === 'number') {
          const nextUser = { ...currentUser, employeeId: result.employeeId };
          sessionStorage.setItem(this.userKey, JSON.stringify(nextUser));
          this.currentUserSubject.next(nextUser);
        }
      }),
      map(result => result.employeeId)
    );
  }

  isAdmin(): boolean { return this.getRole() === 'Admin'; }
  isManager(): boolean { return this.getRole() === 'Manager'; }
  isAdminOrManager(): boolean { return this.isAdmin() || this.isManager(); }

  private getStoredUser(): AuthResponse | null {
    const u = sessionStorage.getItem(this.userKey);
    if (!u) return null;

    const user = JSON.parse(u) as AuthResponse;
    if (typeof user.employeeId === 'number') return user;

    const tokenEmployeeId = this.getEmployeeIdFromToken(sessionStorage.getItem(this.tokenKey));
    if (tokenEmployeeId !== null) {
      user.employeeId = tokenEmployeeId;
      sessionStorage.setItem(this.userKey, JSON.stringify(user));
    }

    return user;
  }

  private getEmployeeIdFromToken(token: string | null): number | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const employeeId = Number(payload?.employeeId);
      return Number.isFinite(employeeId) && employeeId > 0 ? employeeId : null;
    } catch {
      return null;
    }
  }
}