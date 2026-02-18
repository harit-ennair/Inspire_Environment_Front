import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:8080/api';
  private authApi = `${this.api}/auth`;

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.authApi}/login`, data);
  }

  logout(token: string): Observable<any> {
    return this.http.post(`${this.authApi}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
