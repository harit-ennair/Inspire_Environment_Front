// ── Response shapes ──────────────────────────────────────────

export interface UserRef {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName?: string;
  roleName?: string;
}

export interface AttendanceStudent {
  id: number;
  studentCode: string;
  user: UserRef;
}

export interface Attendance {
  id: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | string;
  checkInTime?: string;
  student: AttendanceStudent;
}

export interface StaffDetail {
  id: number;
  position?: string;
  user: UserRef;
}

export interface Activity {
  id: number;
  title: string;
  type?: 'SESSION' | 'VISIT' | 'WORKSHOP' | string;
  startDate?: string;   // response field name
  endDate?: string;     // response field name
  managedBy?: string;   // display name in response
  staff?: StaffDetail;  // single object in response
  attendances?: Attendance[];
  tasks?: any[];
  // optional extras some endpoints may return
  description?: string;
  location?: string;
  status?: string;
}

// ── Request payload (matches backend ActivityRequestDTO) ──────

export interface ActivityPayload {
  title: string;
  type: 'SESSION' | 'VISIT' | 'WORKSHOP';
  startTime: string;   // LocalDateTime — e.g. "2026-03-01T10:00"
  endTime: string;
  managedBy: number;   // Staff ID
}
