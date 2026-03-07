import { useState, useCallback } from 'react';
import type { Employee, Attendance, DashboardStats } from '@/types';
import { apiService } from '@/services/api';

interface UseHRMSReturn {
  // Data
  employees: Employee[];
  attendance: Attendance[];
  dashboardStats: DashboardStats | null;
  
  // Loading states
  loadingEmployees: boolean;
  loadingAttendance: boolean;
  loadingDashboard: boolean;
  
  // Error states
  employeesError: string | null;
  attendanceError: string | null;
  dashboardError: string | null;
  
  // Actions
  fetchEmployees: () => Promise<void>;
  fetchAttendance: (employeeId?: string) => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'employeeId' | 'createdAt'>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  markAttendance: (attendance: { employeeId: string; date: string; status: 'Present' | 'Absent' }) => Promise<void>;
  deleteAttendanceRecord: (id: string) => Promise<void>;
}

export function useHRMS(): UseHRMSReturn {
  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Loading states
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Error states
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Fetch all employees
  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    setEmployeesError(null);
    try {
      const response = await apiService.getAllEmployees();
      if (response.success && response.data) {
        setEmployees(response.data);
      }
    } catch (error: any) {
      setEmployeesError(error.message || 'Failed to fetch employees');
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  // Fetch attendance records
  const fetchAttendance = useCallback(async (employeeId?: string) => {
    setLoadingAttendance(true);
    setAttendanceError(null);
    try {
      const response = await apiService.getAllAttendance(employeeId);
      if (response.success && response.data) {
        setAttendance(response.data);
      }
    } catch (error: any) {
      setAttendanceError(error.message || 'Failed to fetch attendance');
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    setLoadingDashboard(true);
    setDashboardError(null);
    try {
      const response = await apiService.getDashboardStats();
      if (response.success && response.data) {
        setDashboardStats(response.data);
      }
    } catch (error: any) {
      setDashboardError(error.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  // Add new employee
  const addEmployee = useCallback(async (employee: Omit<Employee, 'id' | 'employeeId' | 'createdAt'>) => {
    try {
      const response = await apiService.createEmployee(employee);
      if (response.success && response.data) {
        setEmployees(prev => [...prev, response.data!]);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add employee');
    }
  }, []);

  // Delete employee
  const deleteEmployee = useCallback(async (id: string) => {
    try {
      const response = await apiService.deleteEmployee(id);
      if (response.success) {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        // Also remove related attendance records
        setAttendance(prev => prev.filter(att => att.employeeId !== id));
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete employee');
    }
  }, []);

  // Mark attendance
  const markAttendance = useCallback(async (attendanceData: { employeeId: string; date: string; status: 'Present' | 'Absent' }) => {
    try {
      const response = await apiService.markAttendance(attendanceData);
      if (response.success && response.data) {
        setAttendance(prev => {
          const existingIndex = prev.findIndex(
            att => att.employeeId === attendanceData.employeeId && att.date === attendanceData.date
          );
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = response.data!;
            return updated;
          }
          return [response.data!, ...prev];
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark attendance');
    }
  }, []);

  // Delete attendance record
  const deleteAttendanceRecord = useCallback(async (id: string) => {
    try {
      const response = await apiService.deleteAttendance(id);
      if (response.success) {
        setAttendance(prev => prev.filter(att => att.id !== id));
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete attendance record');
    }
  }, []);

  return {
    employees,
    attendance,
    dashboardStats,
    loadingEmployees,
    loadingAttendance,
    loadingDashboard,
    employeesError,
    attendanceError,
    dashboardError,
    fetchEmployees,
    fetchAttendance,
    fetchDashboardStats,
    addEmployee,
    deleteEmployee,
    markAttendance,
    deleteAttendanceRecord,
  };
}
