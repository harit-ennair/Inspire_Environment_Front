import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private api = 'http://localhost:8080/api';
  private attendanceApi = `${this.api}/attendance`;

  constructor(private http: HttpClient) {}

  checkInAttendance(activityId: number, studentId: number): Observable<any> {
    return this.http.post(`${this.attendanceApi}/check-in?activityId=${activityId}&studentId=${studentId}`, {});
  }

  updateAttendanceStatus(attendanceId: number, status: string): Observable<any> {
    return this.http.put(`${this.attendanceApi}/${attendanceId}/status?status=${status}`, {});
  }

  getAttendancesByActivity(activityId: number): Observable<any> {
    return this.http.get(`${this.attendanceApi}/activity/${activityId}`);
  }

  getAttendancesByStudent(studentId: number): Observable<any> {
    return this.http.get(`${this.attendanceApi}/student/${studentId}`);
  }
}
