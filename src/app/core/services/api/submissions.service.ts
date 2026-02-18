import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmissionsService {

  private api = 'http://localhost:8080/api';
  private submissionsApi = `${this.api}/submissions`;

  constructor(private http: HttpClient) {}

  submitTask(taskId: number, studentId: number, fileDto: any): Observable<any> {
    return this.http.post(`${this.submissionsApi}/submit?taskId=${taskId}&studentId=${studentId}`, fileDto);
  }

  assignStudentToTask(taskId: number, studentId: number): Observable<any> {
    return this.http.post(`${this.submissionsApi}/assign?taskId=${taskId}&studentId=${studentId}`, {});
  }

  assignDepartmentToTask(taskId: number, departmentId: number): Observable<any> {
    return this.http.post(`${this.submissionsApi}/assign-department?taskId=${taskId}&departmentId=${departmentId}`, {});
  }

  getSubmissionsByTask(taskId: number): Observable<any> {
    return this.http.get(`${this.submissionsApi}/task/${taskId}`);
  }

  getMySubmissions(studentId: number): Observable<any> {
    return this.http.get(`${this.submissionsApi}/my-submissions/${studentId}`);
  }

  getSubmissionsByStudent(studentId: number): Observable<any> {
    return this.http.get(`${this.submissionsApi}/student/${studentId}`);
  }

  getAllSubmissions(): Observable<any> {
    return this.http.get(this.submissionsApi);
  }
}
