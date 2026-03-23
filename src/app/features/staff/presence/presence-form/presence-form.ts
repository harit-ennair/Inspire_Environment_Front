import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PresenceService } from '../../../../core/services/api/presence.service';
import { StudentsService } from '../../../../core/services/api/students.service';

@Component({
  selector: 'app-presence-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presence-form.html',
  styleUrls: ['./presence-form.css'],
})
export class PresenceForm implements OnInit {

  private presenceService = inject(PresenceService);
  private studentsService = inject(StudentsService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  presence = signal<any>({
    status: '',
    checkInTime: '',
    checkOutTime: '',
    studentId: null
  });

  students = signal<any[]>([]);
  studentSuggestions = signal<any[]>([]);
  studentSearch = '';
  showSuggestions = false;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  isEdit = signal<boolean>(false);
  id = signal<number | null>(null);

  readonly STATUS_OPTIONS = ['PENDING', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

  ngOnInit(): void {
    this.loadStudents();
    
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.isEdit.set(true);
      this.id.set(Number(paramId));
      this.loadPresence(Number(paramId));
    }
  }

  loadStudents() {
    this.studentsService.getAllStudents().subscribe({
      next: (data) => {
        this.students.set(data);
      },
      error: (err) => {
        console.error('Failed to load students', err);
      }
    });
  }

  loadPresence(id: number) {
    this.loading.set(true);
    this.error.set(null);
    this.presenceService.getPresenceById(id).subscribe({
      next: (data) => {
        this.processPresenceData(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.warn('getPresenceById failed, trying getAllPresences as fallback', err);
        // Fallback: load all presences and find the one with matching ID
        this.presenceService.getAllPresences().subscribe({
          next: (list: any[]) => {
            const found = list.find(p => p.id === id);
            if (found) {
              this.processPresenceData(found);
              this.loading.set(false);
            } else {
              this.error.set('Presence record not found.');
              this.loading.set(false);
            }
          },
          error: () => {
            this.error.set('Failed to load presence record.');
            this.loading.set(false);
          }
        });
      }
    });
  }

  private processPresenceData(data: any) {
    // Helper to format time for datetime-local (YYYY-MM-DDTHH:mm)
    const formatTime = (time: any) => {
      if (!time) return '';
      const s = String(time).replace(' ', 'T');
      return s.length >= 16 ? s.substring(0, 16) : s;
    };

    const formatted = {
      ...data,
      checkInTime: formatTime(data.checkInTime),
      checkOutTime: formatTime(data.checkOutTime),
      studentId: data.studentId ?? data.student?.id
    };
    this.presence.set(formatted);
    
    if (data.student) {
      const s = data.student;
      const firstName = s.user?.firstName || s.firstName || '';
      const lastName = s.user?.lastName || s.lastName || '';
      this.studentSearch = `${firstName} ${lastName}`.trim();
    }
  }

  onStudentSearchInput(): void {
    const q = this.studentSearch.trim().toLowerCase();
    if (!q) {
      this.studentSuggestions.set([]);
      this.showSuggestions = false;
      return;
    }
    const matches = this.students().filter(s => {
      const name = `${s.user?.firstName || s.firstName} ${s.user?.lastName || s.lastName}`.toLowerCase();
      const code = (s.studentCode || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
    this.studentSuggestions.set(matches.slice(0, 8));
    this.showSuggestions = true;
  }

  selectStudent(student: any): void {
    this.studentSearch = `${student.user?.firstName || student.firstName} ${student.user?.lastName || student.lastName}`;
    this.presence.update(p => ({ ...p, studentId: student.id }));
    this.showSuggestions = false;
  }

  clearStudentSearch(): void {
    this.studentSearch = '';
    this.presence.update(p => ({ ...p, studentId: null }));
    this.studentSuggestions.set([]);
    this.showSuggestions = false;
  }

  save() {
    const data = this.presence();
    this.loading.set(true);

    if (this.isEdit()) {
      this.presenceService.updatePresence(this.id()!, data).subscribe({
        next: () => {
          this.router.navigate(['/staff/presence']);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.presenceService.createPresence(data).subscribe({
        next: () => {
          this.router.navigate(['/staff/presence']);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }
}
