import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RolesService } from '../../../../core/services/api/roles.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css'],
})
export class RolesList implements OnInit {

  // Inject services
  private rolesService = inject(RolesService);
  private router = inject(Router);

  // Signals
  roles = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.loading.set(true);
    this.rolesService.getAllRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load roles');
        this.loading.set(false);
      }
    });
  }

  editRole(id: number) {
    this.router.navigate(['/admin/roles/edit', id]);
  }

  deleteRole(id: number) {
    if (confirm('Are you sure you want to delete this role?')) {
      this.rolesService.deleteRole(id).subscribe(() => {
        this.roles.set(this.roles().filter(r => r.id !== id));
      });
    }
  }
}