import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DepartmentsService } from '../../../../core/services/api/departments.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './departments.html',
  styleUrls: ['./departments.css'],
})
export class DepartmentsList implements OnInit {

  // Inject services
  private departmentsService = inject(DepartmentsService);
  private router = inject(Router);

  // Signals
  departments = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments() {
    this.loading.set(true);
    this.departmentsService.getAllDepartments().subscribe({
      next: (data) => {
        this.departments.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load departments');
        this.loading.set(false);
      }
    });
  }

  editDepartment(id: number) {
    this.router.navigate(['/admin/departments/edit', id]);
  }

  deleteDepartment(id: number) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.departmentsService.deleteDepartment(id).subscribe(() => {
        this.departments.set(this.departments().filter(d => d.id !== id));
      });
    }
  }
}
