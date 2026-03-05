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
    const userName = sessionStorage.getItem('userName');
    if (userName) return userName;
    
    // Fallback: construct from firstName and lastName if userName not found
    const firstName = sessionStorage.getItem('firstName');
    const lastName = sessionStorage.getItem('lastName');
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return null;
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

  // Check if sessionStorage is available and working
  isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('SessionStorage is not available:', e);
      return false;
    }
  }

  // Get all session data for debugging
  getSessionData(): any {
    return {
      token: this.getToken() ? 'present' : 'missing',
      refreshToken: this.getRefreshToken() ? 'present' : 'missing',
      userId: this.getUserId(),
      email: this.getEmail(),
      userName: this.getUserName(),
      firstName: this.getFirstName(),
      lastName: this.getLastName(),
      role: this.getRole(),
      isAuthenticated: this.isAuthenticated()
    };
  }

  clearStorage(): void {
    console.log('Clearing session storage');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('firstName');
    sessionStorage.removeItem('lastName');
  }
}
