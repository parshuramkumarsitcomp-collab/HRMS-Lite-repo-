import { useState, useCallback, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, Menu, X, Server, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dashboard } from '@/sections/Dashboard';
import { EmployeeManagement } from '@/sections/EmployeeManagement';
import { AttendanceManagement } from '@/sections/AttendanceManagement';
import { useHRMS } from '@/hooks/useHRMS';
import type { ViewState } from '@/types';
import { apiService } from '@/services/api';

function App() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  const {
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
  } = useHRMS();

  // Check backend connection
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await apiService.healthCheck();
        setBackendStatus('connected');
      } catch {
        setBackendStatus('disconnected');
      }
    };
    checkBackend();
  }, []);

  const navigation = [
    { id: 'dashboard' as ViewState, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees' as ViewState, label: 'Employees', icon: Users },
    { id: 'attendance' as ViewState, label: 'Attendance', icon: Calendar },
  ];

  const handleRefreshEmployees = useCallback(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleRefreshAttendance = useCallback(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleRefreshDashboard = useCallback(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            stats={dashboardStats}
            loading={loadingDashboard}
            error={dashboardError}
            onRefresh={handleRefreshDashboard}
          />
        );
      case 'employees':
        return (
          <EmployeeManagement
            employees={employees}
            loading={loadingEmployees}
            error={employeesError}
            onRefresh={handleRefreshEmployees}
            onAddEmployee={addEmployee}
            onDeleteEmployee={deleteEmployee}
          />
        );
      case 'attendance':
        return (
          <AttendanceManagement
            employees={employees}
            attendance={attendance}
            loading={loadingAttendance}
            error={attendanceError}
            onRefresh={handleRefreshAttendance}
            onMarkAttendance={markAttendance}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HRMS Lite</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {/* Backend Status */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Backend:</span>
              {backendStatus === 'checking' && (
                <span className="text-yellow-600">Checking...</span>
              )}
              {backendStatus === 'connected' && (
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Connected
                </span>
              )}
              {backendStatus === 'disconnected' && (
                <span className="text-red-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Offline
                </span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-900">Admin User</p>
            <p>admin@company.com</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 lg:hidden">
            {navigation.find((n) => n.id === activeView)?.label}
          </h1>
          <div className="hidden lg:block" />
        </header>

        {/* Backend Offline Banner */}
        {backendStatus === 'disconnected' && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Backend Server Not Connected</h3>
                <p className="text-red-700 text-sm mt-1">
                  The backend API is not running. To use this app locally:
                </p>
                <ol className="text-red-700 text-sm mt-2 ml-4 list-decimal">
                  <li>Open terminal and run: <code className="bg-red-100 px-1.5 py-0.5 rounded">cd hrms-backend && npm start</code></li>
                  <li>Then in another terminal: <code className="bg-red-100 px-1.5 py-0.5 rounded">cd app && npm run dev</code></li>
                  <li>Open <a href="http://localhost:5173" className="underline">http://localhost:5173</a></li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}

export default App;
