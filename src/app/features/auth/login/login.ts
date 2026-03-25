import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/api/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = this.authService.isStorageAvailable()
    ? ''
    : 'Browser storage is not available. Please enable cookies and try again.';

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (!this.authService.isStorageAvailable()) {
      this.errorMessage = 'Browser storage is not available. Please enable cookies and try again.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData = { email: this.email, password: this.password };

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (!response?.accessToken) {
          this.errorMessage = 'Authentication failed: No token received';
          return;
        }

        this.storeSessionData(response);

        if (!sessionStorage.getItem('token')) {
          this.errorMessage = 'Failed to save authentication data. Please try again.';
          return;
        }

        this.navigateByRole(response?.role);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error?.error || 'Invalid credentials. Please try again.';
      }
    });
  }

  private storeSessionData(response: any): void {
    this.setSessionItem('token', response?.accessToken);
    this.setSessionItem('refreshToken', response?.refreshToken);
    this.setSessionItem('role', response?.role);
    this.setSessionItem('email', response?.email);

    if (response?.userId !== undefined && response?.userId !== null) {
      this.setSessionItem('userId', String(response.userId));
    }

    this.setSessionItem('firstName', response?.firstName);
    this.setSessionItem('lastName', response?.lastName);

    const userName = [response?.firstName, response?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    this.setSessionItem('userName', userName || undefined);
  }

  private setSessionItem(key: string, value?: string): void {
    if (value) {
      sessionStorage.setItem(key, value);
    }
  }

  private navigateByRole(role?: string): void {
    const roleRoutes: Record<string, string> = {
      ADMIN: '/admin',
      STAFF: '/staff',
      STUDENT: '/student',
    };

    this.router.navigate([roleRoutes[role || ''] || '/']);
  }
}
