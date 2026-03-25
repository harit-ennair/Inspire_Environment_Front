export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | string;
export type ActivityType = 'SESSION' | 'VISIT' | 'WORKSHOP';

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
  status: AttendanceStatus;
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
  type?: ActivityType | string;
  startDate?: string;
  endDate?: string;
  managedBy?: string;
  staff?: StaffDetail;
  attendances?: Attendance[];
  description?: string;
  location?: string;
  status?: string;
}

export interface ActivityPayload {
  title: string;
  type: ActivityType;
  startTime: string;
  endTime: string;
  managedBy: number;
}
