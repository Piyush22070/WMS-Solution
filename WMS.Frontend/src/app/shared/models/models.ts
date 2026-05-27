export interface LoginRequest { username: string; password: string; }
export interface AuthResponse { token: string; username: string; role: string; employeeId?: number | null; expiry: string; }

export interface Employee {
  employeeId?: number;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  password?: string;
  phoneNumber: string;
  gender: string;
  dob: string;
  doj: string;
  departmentId: number;
  roleId: number;
  status?: string;
  departmentName?: string;
  roleName?: string;
}

export interface Department {
  departmentId?: number;
  departmentName: string;
  description?: string;
}

export interface Role {
  roleId?: number;
  roleName: string;
  description?: string;
}

export interface Attendance {
  attendanceId?: number;
  empId?: number;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  workMode?: string;
  attendanceDate?: string;
}

export interface Leave {
  leaveId?: number;
  empId: number;
  leaveType: string;
  reason?: string;
  fromDate: string;
  toDate: string;
  status?: string;
  appliedOn?: string;
  approvedBy?: number;
}

export interface Project {
  projectId?: number;
  projectName: string;
  clientId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  clientName?: string;
}

export interface Client {
  clientId?: number;
  clientName: string;
  clientAddress?: string;
  clientPhoneNumber?: number;
  clientLocation?: string;
  status?: boolean;
}

export interface Allocation {
  allocationId?: number;
  empId: number;
  projectId: number;
  assignedOn: string;
  createdBy: string;
  employeeName?: string;
  projectName?: string;
  status?: boolean;
}

export interface Announcement {
  announcementId?: number;
  title: string;
  message: string;
  createdBy: number;
  createdOn?: string;
  isActive?: boolean;
}

export interface DashboardSummary {
  totalEmployees: number;
  activeProjects: number;
  pendingLeaves: number;
  todayAttendance: number;
  totalWorkingHours: number;
  employeeAttendance: EmployeeAttendanceSummary[];
}

export interface EmployeeAttendanceSummary {
  employeeId: number;
  employeeName: string;
  workingDays: number;
  workingHours: number;
}