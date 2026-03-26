import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {

  private api = 'http://localhost:8080/api';
  private activitiesApi = `${this.api}/activities`;

  constructor(private http: HttpClient) {}

  getAllActivities(): Observable<any> {
    return this.http.get(this.activitiesApi);
  }

  searchActivities(search: string = '', page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.activitiesApi}/search`, {
      params: { search, page: page.toString(), size: size.toString() }
    });
  }

  getActivityById(id: number): Observable<any> {
    return this.http.get(`${this.activitiesApi}/${id}`);
  }

  createActivity(data: any): Observable<any> {
    return this.http.post(this.activitiesApi, data);
  }

  updateActivity(id: number, data: any): Observable<any> {
    return this.http.put(`${this.activitiesApi}/${id}`, data);
  }

  deleteActivity(id: number): Observable<any> {
    return this.http.delete(`${this.activitiesApi}/${id}`);
  }

  getActivitiesByStudent(studentId: number): Observable<any> {
    return this.http.get(`${this.activitiesApi}/student/${studentId}`);
  }

  getActivitiesManagedBy(managedById : number): Observable<any> {
    return this.http.get(`${this.activitiesApi}/managed-by/${managedById }`);
  }

  getActivitiesByDepartment(departmentId: number): Observable<any> {
    return this.http.get(`${this.activitiesApi}/department/${departmentId}`);
  }

  getActivitiesThisWeekByStudent(studentId: number): Observable<any> {
    return this.http.get(`${this.activitiesApi}/this-week/student/${studentId}`);
  }

  getActivitiesThisWeekByDepartment(departmentId: number): Observable<any> {
    return this.http.get(`${this.activitiesApi}/this-week/department/${departmentId}`);
  }

  assignStudentToActivity(activityId: number, studentId: number): Observable<any> {
    return this.http.post(`${this.activitiesApi}/${activityId}/assign-student/${studentId}`, {});
  }

  assignStaffToActivity(activityId: number, staffId: number): Observable<any> {
    return this.http.post(`${this.activitiesApi}/${activityId}/assign-staff/${staffId}`, {});
  }

  assignDepartmentToActivity(activityId: number, departmentId: number): Observable<any> {
    return this.http.post(`${this.activitiesApi}/${activityId}/assign-department/${departmentId}`, {});
  }

  removeStudentFromActivity(activityId: number, studentId: number): Observable<any> {
    return this.http.delete(`${this.activitiesApi}/${activityId}/remove-student/${studentId}`);
  }
}
