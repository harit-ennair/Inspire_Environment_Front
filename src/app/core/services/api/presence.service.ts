import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  private api = 'http://localhost:8080/api';
  private presenceApi = `${this.api}/presences`;

  constructor(private http: HttpClient) {}

  checkInPresence(studentId: number): Observable<any> {
    return this.http.post(`${this.presenceApi}/check-in/${studentId}`, {});
  }

  checkOutPresence(studentId: number): Observable<any> {
    return this.http.post(`${this.presenceApi}/check-out/${studentId}`, {});
  }

  createPresence(data: any): Observable<any> {
    return this.http.post(this.presenceApi, data);
  }

  updatePresence(id: number, data: any): Observable<any> {
    return this.http.put(`${this.presenceApi}/${id}`, data);
  }

  getPresenceById(id: number): Observable<any> {
    return this.http.get(`${this.presenceApi}/${id}`);
  }

  getAllPresences(): Observable<any> {
    return this.http.get(this.presenceApi);
  }

  getPresencesByStudent(studentId: number): Observable<any> {
    return this.http.get(`${this.presenceApi}/student/${studentId}`);
  }

  getPresencesByStatus(status: string): Observable<any> {
    return this.http.get(`${this.presenceApi}/status/${status}`);
  }

  getPresencesByDateRange(start: string, end: string): Observable<any> {
    return this.http.get(`${this.presenceApi}/date-range?start=${start}&end=${end}`);
  }

  getPresencesByStudentAndDateRange(studentId: number, start: string, end: string): Observable<any> {
    return this.http.get(`${this.presenceApi}/student/${studentId}/date-range?start=${start}&end=${end}`);
  }

  getActivePresences(): Observable<any> {
    return this.http.get(`${this.presenceApi}/active`);
  }

  deletePresence(id: number): Observable<any> {
    return this.http.delete(`${this.presenceApi}/${id}`);
  }
}
