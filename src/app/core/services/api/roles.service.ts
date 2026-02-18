import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private api = 'http://localhost:8080/api';
  private rolesApi = `${this.api}/roles`;

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<any> {
    return this.http.get(this.rolesApi);
  }

  getRoleById(id: number): Observable<any> {
    return this.http.get(`${this.rolesApi}/${id}`);
  }

  createRole(data: any): Observable<any> {
    return this.http.post(this.rolesApi, data);
  }

  updateRole(id: number, data: any): Observable<any> {
    return this.http.put(`${this.rolesApi}/${id}`, data);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.rolesApi}/${id}`);
  }
}
