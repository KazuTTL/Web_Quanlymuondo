import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import StudentDashboard from './pages/student/Dashboard'
import StudentDevices from './pages/student/Devices'
import StudentBorrow from './pages/student/Borrow'
import StudentMyRequests from './pages/student/MyRequests'
import StudentHistory from './pages/student/History'
import AdminDashboard from './pages/admin/Dashboard'
import AdminBorrowRequests from './pages/admin/BorrowRequests'
import AdminDevices from './pages/admin/Devices'
import AdminStatistics from './pages/admin/Statistics'
import AdminLayout from './pages/admin/AdminLayout'

export const AuthContext = createContext(null)

function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem('role')
  
  if (!role) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

export function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData, token, role) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return <div className="loading">LOADING...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/devices" element={
            <ProtectedRoute allowedRoles={['user']}>
              <StudentDevices />
            </ProtectedRoute>
          } />
          <Route path="/borrow/:deviceId" element={
            <ProtectedRoute allowedRoles={['user']}>
              <StudentBorrow />
            </ProtectedRoute>
          } />
          <Route path="/my-requests" element={
            <ProtectedRoute allowedRoles={['user']}>
              <StudentMyRequests />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute allowedRoles={['user']}>
              <StudentHistory />
            </ProtectedRoute>
          } />
          
           {/* Admin Routes */}
           <Route path="/admin" element={
             <ProtectedRoute allowedRoles={['admin']}>
               <AdminLayout />
             </ProtectedRoute>
           }>
             <Route index element={<AdminDashboard />} />
             <Route path="requests" element={<AdminBorrowRequests />} />
             <Route path="devices" element={<AdminDevices />} />
             <Route path="statistics" element={<AdminStatistics />} />
           </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App