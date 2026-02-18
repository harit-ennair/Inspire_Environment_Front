import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../../../../core/services/api/students.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';

@Component({
  selector: 'app-students-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrls: ['./students.css'],
})
export class StudentsForm implements OnInit {

  // Inject services
  private studentsService = inject(StudentsService);
  private departmentsService = inject(DepartmentsService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  // Signals
  student = signal<any>({ 
    studentCode: '',
    user: {
      firstName: '', 
      lastName: '', 
      email: '',
      roleId: null,
      departmentId: null
    }
  });
  departments = signal<any[]>([]);
  loading = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  id = signal<number | null>(null);

  ngOnInit(): void {
    this.loadDepartments();
    
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.isEdit.set(true);
      this.id.set(Number(paramId));
      this.loadStudent(Number(paramId));
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

  loadStudent(id: number) {
    this.loading.set(true);
    this.studentsService.getStudentById(id).subscribe({
      next: (data) => {
        // Ensure the data structure matches our form
        if (!data.user) {
          data = {
            studentCode: data.studentCode || '',
            user: {
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              roleId: data.roleId || null,
              departmentId: data.departmentId || null
            }
          };
        }
        this.student.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  save() {
    const data = this.student();
    
    // Ensure roleId is set (default to student role if not set)
    if (!data.user.roleId) {
      data.user.roleId = 3; // Default student role ID - adjust as needed
    }

    if (this.isEdit()) {
      this.studentsService.updateStudent(this.id()!, data).subscribe(() => {
        this.router.navigate(['/admin/students']);
      });
    } else {
      this.studentsService.createStudent(data).subscribe(() => {
        this.router.navigate(['/admin/students']);
      });
    }
  }
}
