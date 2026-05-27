import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Employee, Department, Role, Attendance, Leave,
  Project, Client, Allocation, Announcement, DashboardSummary
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard/summary`);
  }

  // Employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.base}/employees`);
  }
  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.base}/employees/${id}`);
  }
  searchEmployees(params: { name?: string; departmentId?: number; roleId?: number }): Observable<Employee[]> {
    let p = new HttpParams();
    if (params.name) p = p.set('name', params.name);
    if (params.departmentId) p = p.set('departmentId', params.departmentId.toString());
    if (params.roleId) p = p.set('roleId', params.roleId.toString());
    return this.http.get<Employee[]>(`${this.base}/employees/search`, { params: p });
  }
  createEmployee(emp: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.base}/employees`, emp);
  }
  updateEmployee(id: number, emp: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.base}/employees/${id}`, emp);
  }
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/employees/${id}`);
  }
  registerUser(payload: { username: string; password: string; roleId: number; employeeId?: number }): Observable<any> {
    return this.http.post(`${this.base}/auth/register`, payload);
  }

  // Departments
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.base}/departments`);
  }
  createDepartment(dept: Department): Observable<Department> {
    return this.http.post<Department>(`${this.base}/departments`, dept);
  }
  updateDepartment(id: number, dept: Department): Observable<Department> {
    return this.http.put<Department>(`${this.base}/departments/${id}`, dept);
  }
  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/departments/${id}`);
  }

  // Roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.base}/roles`);
  }
  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.base}/roles`, role);
  }
  updateRole(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.base}/roles/${id}`, role);
  }
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/roles/${id}`);
  }

  // Attendance
  checkIn(workMode: string, empId?: number | null): Observable<Attendance> {
    const payload: { empId?: number; workMode: string } = { workMode };
    if (typeof empId === 'number' && empId > 0) payload.empId = empId;
    return this.http.post<Attendance>(`${this.base}/attendance/checkin`, payload);
  }
  checkOut(empId?: number | null): Observable<Attendance> {
    const payload: { empId?: number } = {};
    if (typeof empId === 'number' && empId > 0) payload.empId = empId;
    return this.http.post<Attendance>(`${this.base}/attendance/checkout`, payload);
  }
  getMonthlyAttendance(empId: number, month: number, year: number): Observable<Attendance[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<Attendance[]>(`${this.base}/attendance/monthly/${empId}`, { params });
  }
  getMyMonthlyAttendance(month: number, year: number): Observable<Attendance[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<Attendance[]>(`${this.base}/attendance/mine/monthly`, { params });
  }

  // Leaves
  getLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.base}/leaves`);
  }
  getMyLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.base}/leaves/mine`);
  }
  getPendingLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.base}/leaves/pending`);
  }
  getEmployeeLeaves(empId: number): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.base}/leaves/employee/${empId}`);
  }
  applyLeave(leave: Leave): Observable<Leave> {
    return this.http.post<Leave>(`${this.base}/leaves`, leave);
  }
  approveLeave(id: number, status: string, approvedBy: number): Observable<Leave> {
    return this.http.put<Leave>(`${this.base}/leaves/${id}/approve`, { status, approvedBy });
  }
  cancelLeave(id: number): Observable<any> {
    return this.http.put(`${this.base}/leaves/${id}/cancel`, {});
  }

  // Projects
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.base}/projects`);
  }
  createProject(proj: Project): Observable<Project> {
    return this.http.post<Project>(`${this.base}/projects`, proj);
  }
  updateProject(id: number, proj: Project): Observable<Project> {
    return this.http.put<Project>(`${this.base}/projects/${id}`, proj);
  }
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/projects/${id}`);
  }

  // Clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.base}/clients`);
  }
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.base}/clients`, client);
  }
  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.base}/clients/${id}`, client);
  }
  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/clients/${id}`);
  }

  // Allocations
  getAllocations(): Observable<Allocation[]> {
    return this.http.get<Allocation[]>(`${this.base}/allocations`);
  }
  getEmployeeAllocations(empId: number): Observable<Allocation[]> {
    return this.http.get<Allocation[]>(`${this.base}/allocations/employee/${empId}`);
  }
  getProjectAllocations(projectId: number): Observable<Allocation[]> {
    return this.http.get<Allocation[]>(`${this.base}/allocations/project/${projectId}`);
  }
  createAllocation(alloc: Allocation): Observable<Allocation> {
    return this.http.post<Allocation>(`${this.base}/allocations`, alloc);
  }
  deactivateAllocation(id: number, updatedBy: string): Observable<any> {
    const params = new HttpParams().set('updatedBy', updatedBy);
    return this.http.put(`${this.base}/allocations/${id}/deactivate`, {}, { params });
  }

  // Announcements
  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.base}/announcements`);
  }
  getActiveAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.base}/announcements/active`);
  }
  createAnnouncement(ann: Announcement): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.base}/announcements`, ann);
  }
  deactivateAnnouncement(id: number): Observable<any> {
    return this.http.put(`${this.base}/announcements/${id}/deactivate`, {});
  }
}