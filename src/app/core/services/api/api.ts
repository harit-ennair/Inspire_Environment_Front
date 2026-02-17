import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private api = 'http://localhost:8080/api';

  private rolesApi = `${this.api}/roles`;
  private departmentsApi = `${this.api}/departments`;
  private activitiesApi = `${this.api}/activities`;
  private attendanceApi = `${this.api}/attendance`;
  private presenceApi = `${this.api}/presences`;
  private staffApi = `${this.api}/staff`;
  private studentsApi = `${this.api}/students`;
  private submissionsApi = `${this.api}/submissions`;
  private tasksApi = `${this.api}/tasks`;
  private authApi = `${this.api}/auth`;

  constructor(private http: HttpClient) {}

  // ============================================
  // AUTH (LOGIN / LOGOUT)
  // ============================================

  login(data: any): Observable<any> {
    return this.http.post(`${this.authApi}/login`, data);
  }

  logout(token: string): Observable<any> {
    return this.http.post(`${this.authApi}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // ============================================
  // ROLES
  // ============================================

  getAllRoles() { return this.http.get(this.rolesApi); }
  getRoleById(id: number) { return this.http.get(`${this.rolesApi}/${id}`); }
  createRole(data: any) { return this.http.post(this.rolesApi, data); }
  updateRole(id: number, data: any) { return this.http.put(`${this.rolesApi}/${id}`, data); }
  deleteRole(id: number) { return this.http.delete(`${this.rolesApi}/${id}`); }

  // ============================================
  // DEPARTMENTS
  // ============================================

  getAllDepartments() { return this.http.get(this.departmentsApi); }
  getDepartmentById(id: number) { return this.http.get(`${this.departmentsApi}/${id}`); }
  getDepartmentByName(name: string) { return this.http.get(`${this.departmentsApi}/name/${name}`); }
  createDepartment(data: any) { return this.http.post(this.departmentsApi, data); }
  updateDepartment(id: number, data: any) { return this.http.put(`${this.departmentsApi}/${id}`, data); }
  deleteDepartment(id: number) { return this.http.delete(`${this.departmentsApi}/${id}`); }

  // ============================================
  // ACTIVITIES
  // ============================================

  getAllActivities() { return this.http.get(this.activitiesApi); }
  getActivityById(id: number) { return this.http.get(`${this.activitiesApi}/${id}`); }
  createActivity(data: any) { return this.http.post(this.activitiesApi, data); }
  updateActivity(id: number, data: any) { return this.http.put(`${this.activitiesApi}/${id}`, data); }
  deleteActivity(id: number) { return this.http.delete(`${this.activitiesApi}/${id}`); }

  getActivitiesByStudent(studentId: number) {
    return this.http.get(`${this.activitiesApi}/student/${studentId}`);
  }

  getActivitiesManagedBy(staffEmail: string) {
    return this.http.get(`${this.activitiesApi}/managed-by/${staffEmail}`);
  }

  getActivitiesByDepartment(departmentId: number) {
    return this.http.get(`${this.activitiesApi}/department/${departmentId}`);
  }

  getActivitiesThisWeekByStudent(studentId: number) {
    return this.http.get(`${this.activitiesApi}/this-week/student/${studentId}`);
  }

  getActivitiesThisWeekByDepartment(departmentId: number) {
    return this.http.get(`${this.activitiesApi}/this-week/department/${departmentId}`);
  }

  searchActivities(title: string) {
    return this.http.get(`${this.activitiesApi}/search?title=${title}`);
  }

  assignStudentToActivity(activityId: number, studentId: number) {
    return this.http.post(`${this.activitiesApi}/${activityId}/assign-student/${studentId}`, {});
  }

  assignStaffToActivity(activityId: number, staffId: number) {
    return this.http.post(`${this.activitiesApi}/${activityId}/assign-staff/${staffId}`, {});
  }

  assignDepartmentToActivity(activityId: number, departmentId: number) {
    return this.http.post(`${this.activitiesApi}/${activityId}/assign-department/${departmentId}`, {});
  }

  removeStudentFromActivity(activityId: number, studentId: number) {
    return this.http.delete(`${this.activitiesApi}/${activityId}/remove-student/${studentId}`);
  }

  // ============================================
  // ATTENDANCE
  // ============================================

  checkInAttendance(activityId: number, studentId: number) {
    return this.http.post(`${this.attendanceApi}/check-in?activityId=${activityId}&studentId=${studentId}`, {});
  }

  updateAttendanceStatus(attendanceId: number, status: string) {
    return this.http.put(`${this.attendanceApi}/${attendanceId}/status?status=${status}`, {});
  }

  getAttendancesByActivity(activityId: number) {
    return this.http.get(`${this.attendanceApi}/activity/${activityId}`);
  }

  getAttendancesByStudent(studentId: number) {
    return this.http.get(`${this.attendanceApi}/student/${studentId}`);
  }

  // ============================================
  // PRESENCE
  // ============================================

  checkInPresence(studentId: number) {
    return this.http.post(`${this.presenceApi}/check-in/${studentId}`, {});
  }

  checkOutPresence(studentId: number) {
    return this.http.post(`${this.presenceApi}/check-out/${studentId}`, {});
  }

  createPresence(data: any) { return this.http.post(this.presenceApi, data); }
  updatePresence(id: number, data: any) { return this.http.put(`${this.presenceApi}/${id}`, data); }
  getPresenceById(id: number) { return this.http.get(`${this.presenceApi}/${id}`); }
  getAllPresences() { return this.http.get(this.presenceApi); }
  getPresencesByStudent(studentId: number) { return this.http.get(`${this.presenceApi}/student/${studentId}`); }
  getPresencesByStatus(status: string) { return this.http.get(`${this.presenceApi}/status/${status}`); }
  getPresencesByDateRange(start: string, end: string) {
    return this.http.get(`${this.presenceApi}/date-range?start=${start}&end=${end}`);
  }
  getPresencesByStudentAndDateRange(studentId: number, start: string, end: string) {
    return this.http.get(`${this.presenceApi}/student/${studentId}/date-range?start=${start}&end=${end}`);
  }
  getActivePresences() { return this.http.get(`${this.presenceApi}/active`); }
  deletePresence(id: number) { return this.http.delete(`${this.presenceApi}/${id}`); }

  // ============================================
  // STAFF
  // ============================================

  createStaff(data: any) { return this.http.post(this.staffApi, data); }
  updateStaff(id: number, data: any) { return this.http.put(`${this.staffApi}/${id}`, data); }
  deleteStaff(id: number) { return this.http.delete(`${this.staffApi}/${id}`); }
  getStaffById(id: number) { return this.http.get(`${this.staffApi}/${id}`); }
  getAllStaffs() { return this.http.get(this.staffApi); }
  getStaffsByDepartment(departmentId: number) {
    return this.http.get(`${this.staffApi}/department/${departmentId}`);
  }
  getManagedActivities(staffId: number) {
    return this.http.get(`${this.staffApi}/${staffId}/activities`);
  }

  // ============================================
  // STUDENTS
  // ============================================

  getStudentById(id: number) { return this.http.get(`${this.studentsApi}/${id}`); }
  getAllStudents() { return this.http.get(this.studentsApi); }
  getStudentsByDepartment(departmentId: number) {
    return this.http.get(`${this.studentsApi}/department/${departmentId}`);
  }
  createStudent(data: any) { return this.http.post(this.studentsApi, data); }
  updateStudent(id: number, data: any) { return this.http.put(`${this.studentsApi}/${id}`, data); }
  deleteStudent(id: number) { return this.http.delete(`${this.studentsApi}/${id}`); }

  getStudentActivities(studentId: number) {
    return this.http.get(`${this.studentsApi}/${studentId}/activities`);
  }

  getStudentAttendances(studentId: number) {
    return this.http.get(`${this.studentsApi}/${studentId}/attendances`);
  }

  // ============================================
  // SUBMISSIONS
  // ============================================

  submitTask(taskId: number, studentId: number, fileDto: any) {
    return this.http.post(`${this.submissionsApi}/submit?taskId=${taskId}&studentId=${studentId}`, fileDto);
  }

  assignStudentToTask(taskId: number, studentId: number) {
    return this.http.post(`${this.submissionsApi}/assign?taskId=${taskId}&studentId=${studentId}`, {});
  }

  assignDepartmentToTask(taskId: number, departmentId: number) {
    return this.http.post(`${this.submissionsApi}/assign-department?taskId=${taskId}&departmentId=${departmentId}`, {});
  }

  getSubmissionsByTask(taskId: number) {
    return this.http.get(`${this.submissionsApi}/task/${taskId}`);
  }

  getMySubmissions(studentId: number) {
    return this.http.get(`${this.submissionsApi}/my-submissions/${studentId}`);
  }

  getSubmissionsByStudent(studentId: number) {
    return this.http.get(`${this.submissionsApi}/student/${studentId}`);
  }

  getAllSubmissions() {
    return this.http.get(this.submissionsApi);
  }

  // ============================================
  // TASKS
  // ============================================

  createTask(data: any) { return this.http.post(this.tasksApi, data); }
  updateTask(taskId: number, data: any) { return this.http.put(`${this.tasksApi}/${taskId}`, data); }
  deleteTask(taskId: number) { return this.http.delete(`${this.tasksApi}/${taskId}`); }

  getTasksByActivity(activityId: number) {
    return this.http.get(`${this.tasksApi}/activity/${activityId}`);
  }

  getTasksByStudent(studentId: number) {
    return this.http.get(`${this.tasksApi}/student/${studentId}`);
  }

  getAllTasks() {
    return this.http.get(this.tasksApi);
  }
}