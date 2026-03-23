import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/api/auth.service';
import { StaffService } from '../../../../core/services/api/staff.service';
import { StudentsService } from '../../../../core/services/api/students.service';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class ProfileForm implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private staffService = inject(StaffService);
  private studentsService = inject(StudentsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  profileForm: FormGroup;
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);
  error = signal<string | null>(null);
  userRole = this.authService.getRole()?.toUpperCase();
  userId = Number(this.authService.getUserId());

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    if (!password) return null;
    if (password.length < 6) return { minLength: true };
    return password === confirmPassword ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private currentUserData: any = null;

  loadUserData(): void {
    // Initial pre-fill from auth service / session storage
    this.profileForm.patchValue({
      firstName: this.authService.getFirstName(),
      lastName: this.authService.getLastName(),
      email: this.authService.getEmail()
    });

    if (!this.userId) {
      console.warn('ProfileForm: No userId found');
      this.loading.set(false);
      return;
    }

    const request = this.userRole === 'STUDENT'
      ? this.studentsService.getStudentById(this.userId)
      : this.staffService.getStaffById(this.userId);

    request.subscribe({
      next: (data) => {
        console.log('ProfileForm: User data loaded', data);
        this.currentUserData = data;
        // Handle both flat and nested structures (user vs user.user)
        const userData = data.user || data;
        this.profileForm.patchValue({
          firstName: userData.firstName || this.authService.getFirstName(),
          lastName: userData.lastName || this.authService.getLastName(),
          email: userData.email || this.authService.getEmail()
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('ProfileForm: Error loading user data', err);
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      console.warn('ProfileForm: Form is invalid', this.profileForm.errors);
      return;
    }

    this.submitting.set(true);
    const formValue = this.profileForm.getRawValue();
    
    // Build the payload based on original data structure
    let payload: any = this.currentUserData ? { ...this.currentUserData } : {};
    
    if (payload.user) {
      // Nested structure (Staff/Student object containing a User object)
      payload.user.firstName = formValue.firstName;
      payload.user.lastName = formValue.lastName;
      payload.user.email = formValue.email;
      if (formValue.password) payload.user.password = formValue.password;
    } else {
      // Flat structure
      payload.firstName = formValue.firstName;
      payload.lastName = formValue.lastName;
      payload.email = formValue.email;
      if (formValue.password) payload.password = formValue.password;
    }

    const url = this.userRole === 'STUDENT'
      ? `http://localhost:8080/api/students/${this.userId}`
      : `http://localhost:8080/api/staff/${this.userId}`;
      
    console.log('ProfileForm: Sending update request to', url);
    console.log('ProfileForm: Payload', payload);

    const request = this.userRole === 'STUDENT'
      ? this.studentsService.updateStudent(this.userId, payload)
      : this.staffService.updateStaff(this.userId, payload);

    request.subscribe({
      next: (response) => {
        console.log('ProfileForm: Update success', response);
        sessionStorage.setItem('firstName', formValue.firstName);
        sessionStorage.setItem('lastName', formValue.lastName);
        sessionStorage.setItem('email', formValue.email);
        sessionStorage.setItem('userName', `${formValue.firstName} ${formValue.lastName}`);
        
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        console.error('ProfileForm: Update error', err);
        this.error.set(err.error?.message || 'Failed to update profile. Please check console.');
        this.submitting.set(false);
      }
    });
  }

  get today(): Date {
    return new Date();
  }
}
