import type { Employee, Attendance, DashboardStats, ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Employee APIs
  async getAllEmployees(): Promise<ApiResponse<Employee[]>> {
    return this.request<Employee[]>('/employees');
  }

  async getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
    return this.request<Employee>(`/employees/${id}`);
  }

  async createEmployee(employee: Omit<Employee, 'id' | 'employeeId' | 'createdAt'>): Promise<ApiResponse<Employee>> {
    return this.request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  async deleteEmployee(id: string): Promise<ApiResponse<Employee>> {
    return this.request<Employee>(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance APIs
  async getAllAttendance(employeeId?: string): Promise<ApiResponse<Attendance[]>> {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    return this.request<Attendance[]>(`/attendance${query}`);
  }

  async getAttendanceByEmployee(employeeId: string): Promise<ApiResponse<Attendance[]>> {
    return this.request<Attendance[]>(`/attendance/employee/${employeeId}`);
  }

  async markAttendance(attendance: { employeeId: string; date: string; status: 'Present' | 'Absent' }): Promise<ApiResponse<Attendance>> {
    return this.request<Attendance>('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendance),
    });
  }

  async deleteAttendance(id: string): Promise<ApiResponse<Attendance>> {
    return this.request<Attendance>(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard API
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/dashboard');
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return this.request<{ message: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();
