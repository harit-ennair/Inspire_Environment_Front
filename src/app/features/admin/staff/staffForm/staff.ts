import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffService } from '../../../../core/services/api/staff.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';
import { RolesService } from '../../../../core/services/api/roles.service';

@Component({
  selector: 'app-staff-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff.html',
  styleUrls: ['./staff.css'],
})
export class StaffForm implements OnInit {

  // Inject services
  private staffService = inject(StaffService);
  private departmentsService = inject(DepartmentsService);
  private rolesService = inject(RolesService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  // Signals
  staff = signal<any>({ 
    position: '',
    user: {
      firstName: '', 
      lastName: '', 
      email: '',
      roleId: null,
      departmentId: null
    }
  });
  departments = signal<any[]>([]);
  roles = signal<any[]>([]);
  loading = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  id = signal<number | null>(null);

  ngOnInit(): void {
    this.loadDepartments();
    this.loadRoles();
    
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.isEdit.set(true);
      this.id.set(Number(paramId));
      this.loadStaff(Number(paramId));
    }
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

  loadRoles() {
    this.rolesService.getAllRoles().subscribe({
      next: (data) => {
        // Filter out student role (typically roleId 3 or role name 'STUDENT')
        const filteredRoles = data.filter((role: any) => 
          role.name?.toLowerCase() !== 'student'
        );
        this.roles.set(filteredRoles);
      },
      error: (err) => {
        console.error('Failed to load roles', err);
      }
    });
  }

  loadStaff(id: number) {
    this.loading.set(true);
    this.staffService.getStaffById(id).subscribe({
      next: (data) => {
        // Ensure the data structure matches our form
        if (!data.user) {
          data = {
            position: data.position || '',
            user: {
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              roleId: data.roleId || null,
              departmentId: data.departmentId || null
            }
          };
        }
        this.staff.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  save() {
    const data = this.staff();
    
    // Ensure roleId is set (default to staff role if not set)
    if (!data.user.roleId) {
      data.user.roleId = 2; // Default staff role ID - adjust as needed
    }

    if (this.isEdit()) {
      this.staffService.updateStaff(this.id()!, data).subscribe(() => {
        this.router.navigate(['/admin/staff']);
      });
    } else {
      this.staffService.createStaff(data).subscribe(() => {
        this.router.navigate(['/admin/staff']);
      });
    }
  }
}
