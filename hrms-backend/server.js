const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express()
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data structure
let data = {
  employees: [],
  attendance: []
};

// Load data from file
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(fileData);
    }
  } catch (error) {
    console.error('Error loading data:', error);
    data = { employees: [], attendance: [] };
  }
};

// Save data to file
const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Load initial data
loadData();

// ==================== EMPLOYEE APIs ====================

// Get all employees
app.get('/api/employees', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: data.employees,
      count: data.employees.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
});

// Get single employee by ID
app.get('/api/employees/:id', (req, res) => {
  try {
    const employee = data.employees.find(emp => emp.id === req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
});

// Add new employee
app.post('/api/employees', (req, res) => {
  try {
    const { fullName, email, department } = req.body;

    // Validation
    if (!fullName || !email || !department) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fullName, email, department'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check for duplicate email
    const existingEmployee = data.employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Create new employee
    const newEmployee = {
      id: generateId(),
      employeeId: `EMP${String(data.employees.length + 1).padStart(3, '0')}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      createdAt: new Date().toISOString()
    };

    data.employees.push(newEmployee);
    saveData();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: newEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
  try {
    const employeeIndex = data.employees.findIndex(emp => emp.id === req.params.id);
    
    if (employeeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Remove employee
    const deletedEmployee = data.employees.splice(employeeIndex, 1)[0];
    
    // Also delete related attendance records
    data.attendance = data.attendance.filter(att => att.employeeId !== req.params.id);
    
    saveData();

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: deletedEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
});

// ==================== ATTENDANCE APIs ====================

// Get all attendance records
app.get('/api/attendance', (req, res) => {
  try {
    const { employeeId } = req.query;
    let attendanceRecords = data.attendance;

    // Filter by employee if provided
    if (employeeId) {
      attendanceRecords = attendanceRecords.filter(att => att.employeeId === employeeId);
    }

    // Sort by date (newest first)
    attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: attendanceRecords,
      count: attendanceRecords.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
});

// Get attendance for specific employee
app.get('/api/attendance/employee/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Verify employee exists
    const employee = data.employees.find(emp => emp.id === employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const attendanceRecords = data.attendance
      .filter(att => att.employeeId === employeeId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: attendanceRecords,
      employee: employee,
      count: attendanceRecords.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
});

// Mark attendance
app.post('/api/attendance', (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    // Validation
    if (!employeeId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: employeeId, date, status'
      });
    }

    // Validate status
    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Present" or "Absent"'
      });
    }

    // Validate date format
    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Check if employee exists
    const employee = data.employees.find(emp => emp.id === employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if attendance already marked for this date
    const existingAttendance = data.attendance.find(
      att => att.employeeId === employeeId && att.date === date
    );

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.updatedAt = new Date().toISOString();
      saveData();

      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: existingAttendance
      });
    }

    // Create new attendance record
    const newAttendance = {
      id: generateId(),
      employeeId,
      employeeName: employee.fullName,
      date,
      status,
      createdAt: new Date().toISOString()
    };

    data.attendance.push(newAttendance);
    saveData();

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: newAttendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
});

// Delete attendance record
app.delete('/api/attendance/:id', (req, res) => {
  try {
    const attendanceIndex = data.attendance.findIndex(att => att.id === req.params.id);
    
    if (attendanceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    const deletedRecord = data.attendance.splice(attendanceIndex, 1)[0];
    saveData();

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
      data: deletedRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting attendance record',
      error: error.message
    });
  }
});

// ==================== DASHBOARD API ====================

// Get dashboard stats
app.get('/api/dashboard', (req, res) => {
  try {
    const totalEmployees = data.employees.length;
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = data.attendance.filter(att => att.date === today);
    const presentToday = todayAttendance.filter(att => att.status === 'Present').length;
    const absentToday = todayAttendance.filter(att => att.status === 'Absent').length;

    // Get attendance by department
    const departmentStats = {};
    data.employees.forEach(emp => {
      if (!departmentStats[emp.department]) {
        departmentStats[emp.department] = { total: 0, present: 0 };
      }
      departmentStats[emp.department].total++;
    });

    todayAttendance.forEach(att => {
      const employee = data.employees.find(emp => emp.id === att.employeeId);
      if (employee && att.status === 'Present') {
        departmentStats[employee.department].present++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        notMarked: totalEmployees - todayAttendance.length,
        departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`HRMS Backend Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});
