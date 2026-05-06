import { useState, useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../App'
import { logout, getMyNotifications, markNotificationRead } from '../services/api'
import dayjs from 'dayjs'

function StudentNavbar() {
  const { user, logout: authLogout } = useContext(AuthContext)
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    loadNotifications()
    // Polling mỗi 60 giây để cập nhật thông báo
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await getMyNotifications()
      setNotifications(res.data?.data || res.data || [])
    } catch (e) { /* silent */ }
  }

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.NotificationID === id ? { ...n, IsRead: 1 } : n))
    } catch (e) { /* silent */ }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) { /* silent */ }
    authLogout()
    window.location.href = '/login'
  }

  const unread = notifications.filter(n => !n.IsRead).length
  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">LendHub</Link>

        <div className="navbar-menu">
          <Link to="/" className={`navbar-link ${isActive('/')}`}>Trang Chủ</Link>
          <Link to="/devices" className={`navbar-link ${isActive('/devices')}`}>Thiết Bị</Link>
          <Link to="/my-requests" className={`navbar-link ${isActive('/my-requests')}`}>Yêu Cầu</Link>
          <Link to="/history" className={`navbar-link ${isActive('/history')}`}>Lịch Sử</Link>
          <Link to="/profile" className={`navbar-link ${isActive('/profile')}`}>Hồ Sơ</Link>

          {/* Chuông thông báo */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              className="navbar-link"
              onClick={() => setShowNotif(!showNotif)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              🔔
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-5px',
                  backgroundColor: '#ef4444', color: '#fff',
                  borderRadius: '50%', width: '16px', height: '16px',
                  fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold'
                }}>{unread}</span>
              )}
            </span>

            {showNotif && (
              <div style={{
                position: 'absolute', top: '100%', right: 0,
                width: '320px', maxHeight: '400px', overflowY: 'auto',
                backgroundColor: '#fff', border: '2px solid #0a0a0a',
                boxShadow: '4px 4px 0 #0a0a0a', zIndex: 1000
              }}>
                <div style={{
                  padding: '12px 16px', fontWeight: 'bold',
                  borderBottom: '2px solid #0a0a0a',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span>Thông Báo {unread > 0 && `(${unread} mới)`}</span>
                  <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ padding: '16px', fontSize: '13px', color: '#666', textAlign: 'center' }}>
                    Không có thông báo
                  </p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.NotificationID}
                      style={{
                        padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
                        background: n.IsRead ? '#fff' : '#eff6ff',
                        cursor: n.IsRead ? 'default' : 'pointer'
                      }}
                      onClick={() => !n.IsRead && handleMarkRead(n.NotificationID)}
                    >
                      <p style={{ fontWeight: n.IsRead ? 'normal' : 'bold', fontSize: '13px', marginBottom: '4px' }}>
                        {n.Title}
                      </p>
                      <p style={{ fontSize: '12px', color: '#4b5563' }}>{n.Content}</p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                        {dayjs(n.NgayTao).format('DD/MM/YYYY HH:mm')}
                        {!n.IsRead && <span style={{ color: '#3b82f6', marginLeft: '8px' }}>● Chưa đọc</span>}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <span
            className="navbar-link"
            onClick={() => setShowLogoutConfirm(true)}
            style={{ cursor: 'pointer' }}
          >
            Đăng Xuất
          </span>
        </div>
      </nav>

      {/* Modal xác nhận đăng xuất */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', border: '3px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
            padding: '24px', minWidth: '300px', maxWidth: '400px', width: '90%'
          }}>
            <div style={{
              fontWeight: 'bold', fontSize: '18px', textTransform: 'uppercase',
              borderBottom: '2px solid #0a0a0a', paddingBottom: '12px', marginBottom: '16px'
            }}>Xác Nhận Đăng Xuất</div>
            <p style={{ marginBottom: '24px' }}>Bạn có chắc chắn muốn đăng xuất?</p>
            <div className="flex gap-2 justify-center">
              <button className="btn btn-danger" onClick={handleLogout}>ĐĂNG XUẤT</button>
              <button className="btn" onClick={() => setShowLogoutConfirm(false)}>HỦY</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StudentNavbar
