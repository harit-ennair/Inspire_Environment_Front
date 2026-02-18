import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {

  private api = 'http://localhost:8080/api';
  private studentsApi = `${this.api}/students`;

  constructor(private http: HttpClient) {}

  getStudentById(id: number): Observable<any> {
    return this.http.get(`${this.studentsApi}/${id}`);
  }

  getAllStudents(): Observable<any> {
    return this.http.get(this.studentsApi);
  }

  getStudentsByDepartment(departmentId: number): Observable<any> {
    return this.http.get(`${this.studentsApi}/department/${departmentId}`);
  }

  createStudent(data: any): Observable<any> {
    return this.http.post(this.studentsApi, data);
  }

  updateStudent(id: number, data: any): Observable<any> {
    return this.http.put(`${this.studentsApi}/${id}`, data);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.studentsApi}/${id}`);
  }

  getStudentActivities(studentId: number): Observable<any> {
    return this.http.get(`${this.studentsApi}/${studentId}/activities`);
  }

  getStudentAttendances(studentId: number): Observable<any> {
    return this.http.get(`${this.studentsApi}/${studentId}/attendances`);
  }
}
