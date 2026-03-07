export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Present' | 'Absent';
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  notMarked: number;
  departmentStats: Record<string, {
    total: number;
    present: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export type ViewState = 'dashboard' | 'employees' | 'attendance' | 'employee-attendance';
