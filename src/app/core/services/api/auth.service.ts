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
    console.log('AuthService - sending login request with:', data);
    return this.http.post(`${this.authApi}/login`, data);
  }

  logout(token: string): Observable<any> {
    return this.http.post(`${this.authApi}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Helper methods for token management
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  }

  getRole(): string | null {
    return sessionStorage.getItem('role');
  }

  getUserId(): string | null {
    return sessionStorage.getItem('userId');
  }

  getEmail(): string | null {
    return sessionStorage.getItem('email');
  }

  getUserName(): string | null {
    return sessionStorage.getItem('userName');
  }

  getFirstName(): string | null {
    return sessionStorage.getItem('firstName');
  }

  getLastName(): string | null {
    return sessionStorage.getItem('lastName');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearStorage(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('firstName');
    sessionStorage.removeItem('lastName');
  }
}
