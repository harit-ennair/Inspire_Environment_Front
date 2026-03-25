import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private api = 'http://localhost:8080/api';
  private attendanceApi = `${this.api}/attendances`;

  constructor(private http: HttpClient) {}

  updateAttendanceStatus(attendanceId: number, status: string): Observable<any> {
    return this.http.put(`${this.attendanceApi}/${attendanceId}/status?status=${status}`, {});
  }

  getAttendancesByActivity(activityId: number): Observable<any> {
    return this.http.get(`${this.attendanceApi}/activity/${activityId}`);
  }

  setCheckInTime(attendanceId: number, checkInTime: string): Observable<any> {
    return this.http.put(`${this.attendanceApi}/${attendanceId}/check-in-time?checkInTime=${checkInTime}`, {});
  }
}
