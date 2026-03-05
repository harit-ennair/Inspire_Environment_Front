import { Component } from '@angular/core';
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
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Check if sessionStorage is available
    if (!this.authService.isStorageAvailable()) {
      console.error('SessionStorage is not available! Session data cannot be stored.');
      this.errorMessage = 'Browser storage is not available. Please enable cookies and try again.';
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData = { email: this.email, password: this.password };
    console.log('Sending login data:', loginData);

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Login response:', response);
        
        // Store tokens
        if (response.accessToken) {
          sessionStorage.setItem('token', response.accessToken);
          console.log('Access token stored successfully');
        } else {
          console.error('No access token received from server');
          this.errorMessage = 'Authentication failed: No token received';
          return;
        }
        
        if (response.refreshToken) {
          sessionStorage.setItem('refreshToken', response.refreshToken);
        }
        
        // Store user info
        if (response.userId) {
          sessionStorage.setItem('userId', response.userId.toString());
        }
        if (response.email) {
          sessionStorage.setItem('email', response.email);
        }
        if (response.firstName && response.lastName) {
          sessionStorage.setItem('firstName', response.firstName);
          sessionStorage.setItem('lastName', response.lastName);
          sessionStorage.setItem('userName', `${response.firstName} ${response.lastName}`);
          console.log('User name stored:', `${response.firstName} ${response.lastName}`);
        }
        
        // Debug: Log all stored session data
        console.log('Session storage contents:', {
          token: sessionStorage.getItem('token') ? 'present' : 'missing',
          refreshToken: sessionStorage.getItem('refreshToken') ? 'present' : 'missing',
          userId: sessionStorage.getItem('userId'),
          email: sessionStorage.getItem('email'),
          userName: sessionStorage.getItem('userName'),
          role: sessionStorage.getItem('role')
        });
        
        // Verify data was actually stored
        const storedToken = sessionStorage.getItem('token');
        if (!storedToken) {
          console.error('CRITICAL: Token was not stored in sessionStorage!');
          this.errorMessage = 'Failed to save authentication data. Please try again.';
          return;
        }
        
        // Store role and navigate
        if (response.role) {
          sessionStorage.setItem('role', response.role);
          console.log('Role stored:', response.role);
          
          switch (response.role) {
            case 'ADMIN':
              this.router.navigate(['/admin']);
              break;
            case 'STAFF':
              this.router.navigate(['/staff']);
              break;
            case 'STUDENT':
              this.router.navigate(['/student']);
              break;
            default:
              this.router.navigate(['/']);
          }
        } else {
          console.error('No role received from server');
          this.router.navigate(['/']);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Login error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message,
          url: err.url
        });
        this.errorMessage = err.error?.message || err.error?.error || 'Invalid credentials. Please try again.';
      }
    });
  }
}
