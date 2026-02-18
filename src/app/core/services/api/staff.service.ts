import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  private api = 'http://localhost:8080/api';
  private staffApi = `${this.api}/staff`;

  constructor(private http: HttpClient) {}

  createStaff(data: any): Observable<any> {
    return this.http.post(this.staffApi, data);
  }

  updateStaff(id: number, data: any): Observable<any> {
    return this.http.put(`${this.staffApi}/${id}`, data);
  }

  deleteStaff(id: number): Observable<any> {
    return this.http.delete(`${this.staffApi}/${id}`);
  }

  getStaffById(id: number): Observable<any> {
    return this.http.get(`${this.staffApi}/${id}`);
  }

  getAllStaffs(): Observable<any> {
    return this.http.get(this.staffApi);
  }

  getStaffsByDepartment(departmentId: number): Observable<any> {
    return this.http.get(`${this.staffApi}/department/${departmentId}`);
  }

  getManagedActivities(staffId: number): Observable<any> {
    return this.http.get(`${this.staffApi}/${staffId}/activities`);
  }
}
