import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StaffService } from '../../../../core/services/api/staff.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './staff.html',
  styleUrls: ['./staff.css'],
})
export class StaffList implements OnInit {

  // Inject services
  private staffService = inject(StaffService);
  private departmentsService = inject(DepartmentsService);
  private router = inject(Router);

  // Signals
  staffs = signal<any[]>([]);
  departments = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDepartments();
    this.loadStaffs();
  }

  loadDepartments() {
    this.departmentsService.getAllDepartments().subscribe({
      next: (data) => {
        this.departments.set(data);
      },
      error: (err) => {
        console.error('Failed to load departments', err);
      }
    });
  }

  loadStaffs() {
    this.loading.set(true);
    this.staffService.getAllStaffs().subscribe({
      next: (data) => {
        // Normalize the data structure if needed
        const normalizedData = data.map((staff: any) => {
          if (staff.user) {
            // If data has nested user object, flatten it for display
            return {
              ...staff,
              firstName: staff.user.firstName,
              lastName: staff.user.lastName,
              email: staff.user.email,
              departmentName: staff.user.departmentName,
              roleName: staff.user.roleName,
              departmentId: staff.user.departmentId
            };
          }
          return staff;
        });
        this.staffs.set(normalizedData);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load staff');
        this.loading.set(false);
      }
    });
  }

  getDepartmentName(departmentName: string): string {
    return departmentName || 'N/A';
  }

  editStaff(id: number) {
    this.router.navigate(['/admin/staff/edit', id]);
  }

  deleteStaff(id: number) {
    if (confirm('Are you sure you want to delete this staff member?')) {
      this.staffService.deleteStaff(id).subscribe(() => {
        this.staffs.set(this.staffs().filter(s => s.id !== id));
      });
    }
  }
}
