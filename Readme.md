# WMS API — Frontend Integration Guide

Base URL: `http://localhost:5000/api`
Auth: All endpoints (except login/register) require `Authorization: Bearer <token>` header.

---

## AUTH

### POST `/auth/login`
Login and get JWT token.
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```
**Response:**
```json
{
  "token": "eyJhbGci...",
  "username": "admin",
  "role": "Admin",
  "expiry": "2026-05-25T20:00:00Z"
}
```

---

### POST `/auth/register`
Register a new user account.
```json
{
  "username": "john.doe",
  "password": "Pass@123",
  "roleId": 3
}
```
**roleId:** 1 = Admin, 2 = Manager, 3 = Employee

**Response:** `200 OK` `{ "message": "User registered successfully." }`

---

## EMPLOYEES

### GET `/employees`
Get all employees.
**Auth:** Any role
**Response:** Array of employee objects.

---

### GET `/employees/{id}`
Get employee by ID.
**Auth:** Any role

---

### GET `/employees/search?name=&departmentId=&roleId=`
Search employees. All query params are optional.
**Auth:** Any role

| Query Param  | Type   | Example       |
|--------------|--------|---------------|
| name         | string | `John`        |
| departmentId | int    | `2`           |
| roleId       | int    | `3`           |

---

### POST `/employees`
Create new employee.
**Auth:** Admin, Manager
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phoneNumber": "9876543210",
  "gender": "M",
  "dob": "1995-06-15",
  "doj": "2024-01-10",
  "departmentId": 2,
  "roleId": 3
}
```
**gender:** `M`, `F`, or `O`

**Response:** Created employee object with `employeeId`.

---

### PUT `/employees/{id}`
Update employee.
**Auth:** Admin, Manager
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phoneNumber": "9876543210",
  "gender": "M",
  "dob": "1995-06-15",
  "doj": "2024-01-10",
  "departmentId": 2,
  "roleId": 3,
  "status": "Active"
}
```
**status:** `Active` or `Inactive`

---

### DELETE `/employees/{id}`
Delete employee.
**Auth:** Admin only

**Response:** `204 No Content`

---

## DEPARTMENTS

### GET `/departments`
Get all departments.
**Auth:** Any role

---

### GET `/departments/{id}`
Get department by ID.
**Auth:** Any role

---

### POST `/departments`
Create department.
**Auth:** Admin only
```json
{
  "departmentName": "Engineering",
  "description": "Software Engineering Team"
}
```

---

### PUT `/departments/{id}`
Update department.
**Auth:** Admin only
```json
{
  "departmentName": "Engineering",
  "description": "Updated description"
}
```

---

### DELETE `/departments/{id}`
Delete department.
**Auth:** Admin only

**Response:** `204 No Content`

---

## ROLES

### GET `/roles`
Get all roles. **No auth required.**

---

### GET `/roles/{id}`
Get role by ID.
**Auth:** Admin only

---

### POST `/roles`
Create role.
**Auth:** Admin only
```json
{
  "roleName": "TeamLead",
  "description": "Team Lead role"
}
```

---

### PUT `/roles/{id}`
Update role.
**Auth:** Admin only
```json
{
  "roleName": "TeamLead",
  "description": "Updated description"
}
```

---

### DELETE `/roles/{id}`
Delete role.
**Auth:** Admin only

---

## ATTENDANCE

### POST `/attendance/checkin`
Employee check-in.
**Auth:** Any role
```json
{
  "empId": 1,
  "workMode": "WFO"
}
```
**workMode:** `WFO`, `WFH`, or `Hybrid`

**Response:** Attendance record with `attendanceId`, `checkIn`, `attendanceDate`.

---

### POST `/attendance/checkout`
Employee check-out.
**Auth:** Any role
```json
{
  "empId": 1
}
```
**Response:** Updated attendance record with `checkOut` and `totalHours`.

---

### GET `/attendance/monthly/{empId}?month=5&year=2026`
Get monthly attendance for an employee.
**Auth:** Any role

| Query Param | Type | Example |
|-------------|------|---------|
| month       | int  | `5`     |
| year        | int  | `2026`  |

**Response:** Array of attendance records for that month.

---

## LEAVES

### GET `/leaves`
Get all leave requests.
**Auth:** Admin, Manager

---

### GET `/leaves/pending`
Get all pending leave requests (for manager approval).
**Auth:** Admin, Manager

---

### GET `/leaves/employee/{empId}`
Get all leaves for a specific employee.
**Auth:** Any role

---

### GET `/leaves/{id}`
Get leave by ID.
**Auth:** Any role

---

### POST `/leaves`
Apply for leave.
**Auth:** Any role
```json
{
  "empId": 1,
  "leaveType": "Sick",
  "reason": "Fever and cold",
  "fromDate": "2026-06-01",
  "toDate": "2026-06-03"
}
```
**leaveType:** `Sick`, `Casual`, or `Earned`

**Response:** Created leave with `leaveId` and `status: "Pending"`.

---

### PUT `/leaves/{id}/approve`
Approve or reject a leave.
**Auth:** Admin, Manager
```json
{
  "status": "Approved",
  "approvedBy": 2
}
```
**status:** `Approved` or `Rejected`
**approvedBy:** Manager's `employeeId`

---

### PUT `/leaves/{id}/cancel`
Cancel a leave application.
**Auth:** Any role

**Response:** `200 OK` `{ "message": "Leave cancelled." }`

---

## PROJECTS

### GET `/projects`
Get all projects.
**Auth:** Any role

---

### GET `/projects/{id}`
Get project by ID.
**Auth:** Any role

---

### POST `/projects`
Create project.
**Auth:** Admin, Manager
```json
{
  "projectName": "WMS Portal",
  "clientId": 1,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

**Response:** Created project with `projectId` and `status: "Active"`.

---

### PUT `/projects/{id}`
Update project.
**Auth:** Admin, Manager
```json
{
  "projectName": "WMS Portal v2",
  "clientId": 1,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

---

### DELETE `/projects/{id}`
Delete project.
**Auth:** Admin only

---

## CLIENTS

### GET `/clients`
Get all clients.
**Auth:** Any role

---

### GET `/clients/{id}`
Get client by ID.
**Auth:** Any role

---

### POST `/clients`
Create client.
**Auth:** Admin, Manager
```json
{
  "clientName": "Acme Corp",
  "clientAddress": "123 Main St, New York",
  "clientPhoneNumber": 9876543210,
  "clientLocation": "New York"
}
```

---

### PUT `/clients/{id}`
Update client.
**Auth:** Admin, Manager
```json
{
  "clientName": "Acme Corp",
  "clientAddress": "456 New St, New York",
  "clientPhoneNumber": 9876543210,
  "clientLocation": "New York"
}
```

---

### DELETE `/clients/{id}`
Delete client.
**Auth:** Admin only

---

## ALLOCATIONS (Employee–Project)

### GET `/allocations/employee/{empId}`
Get all project allocations for an employee.
**Auth:** Any role

---

### GET `/allocations/project/{projectId}`
Get all employees allocated to a project.
**Auth:** Any role

---

### POST `/allocations`
Allocate employee to project.
**Auth:** Admin, Manager
```json
{
  "empId": 1,
  "projectId": 2,
  "assignedOn": "2026-05-25",
  "createdBy": "admin"
}
```

**Response:** Allocation record with `allocationId`, `employeeName`, `projectName`.

---

### PUT `/allocations/{id}/deactivate?updatedBy=admin`
Deactivate an allocation.
**Auth:** Admin, Manager

| Query Param | Type   | Example |
|-------------|--------|---------|
| updatedBy   | string | `admin` |

**Response:** `200 OK` `{ "message": "Allocation deactivated." }`

---

## ANNOUNCEMENTS

### GET `/announcements`
Get all announcements.
**Auth:** Any role

---

### GET `/announcements/active`
Get only active announcements (for notice board display).
**Auth:** Any role

---

### GET `/announcements/{id}`
Get announcement by ID.
**Auth:** Any role

---

### POST `/announcements`
Create announcement.
**Auth:** Admin only
```json
{
  "title": "Office Closed",
  "message": "Office will remain closed on 26th May due to public holiday.",
  "createdBy": 1
}
```
**createdBy:** Admin's `userId`

---

### PUT `/announcements/{id}/deactivate`
Deactivate (hide) an announcement.
**Auth:** Admin only

**Response:** `200 OK` `{ "message": "Announcement deactivated." }`

---

## DASHBOARD

### GET `/dashboard/summary`
Get KPI summary counts for dashboard.
**Auth:** Any role

**Response:**
```json
{
  "totalEmployees": 42,
  "activeProjects": 7,
  "pendingLeaves": 3,
  "todayAttendance": 0
}
```

---

## RESPONSE CODES

| Code | Meaning                          |
|------|----------------------------------|
| 200  | OK                               |
| 201  | Created                          |
| 204  | No Content (delete success)      |
| 400  | Bad Request (validation failed)  |
| 401  | Unauthorized (no/invalid token)  |
| 403  | Forbidden (wrong role)           |
| 404  | Not Found                        |
| 409  | Conflict (duplicate entry)       |
| 500  | Internal Server Error            |

---

## SEEDED DATA (Ready to use)

| Item       | Value                          |
|------------|-------------------------------|
| Admin user | `admin` / `Admin@123`         |
| Roles      | Admin (1), Manager (2), Employee (3) |
| Departments| HR (1), Engineering (2), Finance (3) |

---

## FRONTEND SETUP TIPS

**Store token in memory or sessionStorage:**
```js
const token = response.data.token;
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**Angular HTTP Interceptor example:**
```ts
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = this.authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(req);
}
```

**Date format:** Always send dates as `YYYY-MM-DD` (ISO 8601).