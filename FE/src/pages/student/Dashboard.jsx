import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../App'
import { logout } from '../../services/api'

function Navbar() {
  const { user, logout: authLogout } = useContext(AuthContext)

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout()
      authLogout()
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">LendHub</Link>
      
      {user?.role === 'admin' ? (
        <div className="navbar-menu">
          <Link to="/admin" className="navbar-link">Dashboard</Link>
          <Link to="/admin/requests" className="navbar-link">Yêu Cầu</Link>
          <Link to="/admin/devices" className="navbar-link">Thiết Bị</Link>
          <Link to="/admin/statistics" className="navbar-link">Thống Kê</Link>
          <span className="navbar-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            Đăng Xuất
          </span>
        </div>
      ) : (
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Trang Chủ</Link>
          <Link to="/devices" className="navbar-link">Thiết Bị</Link>
          <Link to="/my-requests" className="navbar-link">Yêu Cầu Của Tôi</Link>
          <Link to="/history" className="navbar-link">Lịch Sử</Link>
          <span className="navbar-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            Đăng Xuất
          </span>
        </div>
      )}
    </nav>
  )
}

function StudentDashboard() {
  const { user } = useContext(AuthContext)

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1 style={{ fontSize: '32px', textTransform: 'uppercase', marginBottom: '24px' }}>
          Xin Chào, {user?.name || 'Sinh Viên'}
        </h1>

        <div className="grid grid-cols-3 gap-4">
          <Link to="/devices" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '18px' }}>📦 Thiết Bị</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>
              Xem danh sách thiết bị có sẵn
            </p>
          </Link>

          <Link to="/my-requests" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '18px' }}>📋 Yêu Cầu Của Tôi</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>
              Theo dõi yêu cầu mượn
            </p>
          </Link>

          <Link to="/history" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '18px' }}>📜 Lịch Sử</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>
              Xem lịch sử mượn trả
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard