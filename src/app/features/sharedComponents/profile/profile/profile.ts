import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/api/auth.service';
import { StaffService } from '../../../../core/services/api/staff.service';
import { StudentsService } from '../../../../core/services/api/students.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private staffService = inject(StaffService);
  private studentsService = inject(StudentsService);

  user = signal<any>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  userName = this.authService.getUserName() || 'User';



  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const role = this.authService.getRole()?.toUpperCase();
    const userId = Number(this.authService.getUserId());

    const sessionUser = {
      firstName: this.authService.getFirstName(),
      lastName: this.authService.getLastName(),
      email: this.authService.getEmail(),
      role,
    };

    if (sessionUser.firstName || sessionUser.lastName || sessionUser.email) {
      this.user.set(sessionUser);
    }

    if (!userId) {
      this.loading.set(false);
      return;
    }

    const request = role === 'STUDENT'
      ? this.studentsService.getStudentById(userId)
      : this.staffService.getStaffById(userId);

    request.subscribe({
      next: (data) => {
        const userData = data.user || data;
        this.user.set({ ...sessionUser, ...userData });
        this.loading.set(false);
      },
      error: () => {
        if (!this.user()) {
          this.error.set('Failed to load profile information');
        }
        this.loading.set(false);
      },
    });
  }

  get today(): Date {
    return new Date();
  }
}
