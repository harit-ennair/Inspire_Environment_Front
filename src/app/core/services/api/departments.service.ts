import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentsService {

  private api = 'http://localhost:8080/api';
  private departmentsApi = `${this.api}/departments`;

  constructor(private http: HttpClient) {}

  getAllDepartments(): Observable<any> {
    return this.http.get(this.departmentsApi);
  }

  getDepartmentById(id: number): Observable<any> {
    return this.http.get(`${this.departmentsApi}/${id}`);
  }

  getDepartmentByName(name: string): Observable<any> {
    return this.http.get(`${this.departmentsApi}/name/${name}`);
  }

  createDepartment(data: any): Observable<any> {
    return this.http.post(this.departmentsApi, data);
  }

  updateDepartment(id: number, data: any): Observable<any> {
    return this.http.put(`${this.departmentsApi}/${id}`, data);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.departmentsApi}/${id}`);
  }
}
