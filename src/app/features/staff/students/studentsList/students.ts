import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StudentsService } from '../../../../core/services/api/students.service';
import { DepartmentsService } from '../../../../core/services/api/departments.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './students.html',
  styleUrls: ['./students.css'],
})
export class StudentsList implements OnInit {

  // Inject services
  private studentsService = inject(StudentsService);
  private departmentsService = inject(DepartmentsService);
  private router = inject(Router);

  // Signals
  students = signal<any[]>([]);
  departments = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDepartments();
    this.loadStudents();
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

  loadStudents() {
    this.loading.set(true);
    this.studentsService.getAllStudents().subscribe({
      next: (data) => {
        // Normalize the data structure if needed
        const normalizedData = data.map((student: any) => {
          if (student.user) {
            // If data has nested user object, flatten it for display
            return {
              ...student,
              firstName: student.user.firstName,
              lastName: student.user.lastName,
              email: student.user.email,
              departmentName: student.user.departmentName,
              roleName: student.user.roleName,
              departmentId: student.user.departmentId
            };
          }
          return student;
        });
        this.students.set(normalizedData);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load students');
        this.loading.set(false);
      }
    });
  }

  getDepartmentName(departmentName: string): string {
    return departmentName || 'N/A';
  }

  editStudent(id: number) {
    this.router.navigate(['/admin/students/edit', id]);
  }

  deleteStudent(id: number) {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentsService.deleteStudent(id).subscribe(() => {
        this.students.set(this.students().filter(s => s.id !== id));
      });
    }
  }
}
