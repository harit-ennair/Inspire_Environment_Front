import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private api = 'http://localhost:8080/api';
  private tasksApi = `${this.api}/tasks`;

  constructor(private http: HttpClient) {}

  createTask(data: any): Observable<any> {
    return this.http.post(this.tasksApi, data);
  }

  updateTask(taskId: number, data: any): Observable<any> {
    return this.http.put(`${this.tasksApi}/${taskId}`, data);
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.tasksApi}/${taskId}`);
  }

  getTasksByActivity(activityId: number): Observable<any> {
    return this.http.get(`${this.tasksApi}/activity/${activityId}`);
  }

  getTasksByStudent(studentId: number): Observable<any> {
    return this.http.get(`${this.tasksApi}/student/${studentId}`);
  }

  getAllTasks(): Observable<any> {
    return this.http.get(this.tasksApi);
  }
}
