import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../App'
import { logout, getMyNotifications } from '../../services/api'

function Navbar() {
  const { user, logout: authLogout } = useContext(AuthContext)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const res = await getMyNotifications()
        setNotifications(res.data?.data || res.data || [])
      } catch (e) { console.error(e) }
    }
    fetchNotif()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      authLogout()
      window.location.href = '/login'
    } catch (err) { console.error(err) }
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">LendHub</Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Trang Chủ</Link>
          <Link to="/devices" className="navbar-link">Thiết Bị</Link>
          <Link to="/my-requests" className="navbar-link">Yêu Cầu Của Tôi</Link>
          <Link to="/history" className="navbar-link">Lịch Sử</Link>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span className="navbar-link" onClick={() => setShowNotif(!showNotif)} style={{ cursor: 'pointer', position: 'relative' }}>
              🔔 {notifications.filter(n => !n.IsRead).length > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: 'red', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notifications.filter(n => !n.IsRead).length}
                </span>
              )}
            </span>
            {showNotif && (
              <div style={{ position: 'absolute', top: '100%', right: 0, width: '300px', backgroundColor: '#fff', border: '2px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a', zIndex: 1000, padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>Thông báo</div>
                {notifications.length === 0 ? <p style={{ fontSize: '13px', color: '#666' }}>Không có thông báo mới</p> :
                  notifications.map(n => (
                    <div key={n.NotificationID} style={{ fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <strong>{n.Title}</strong><br />{n.Content}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
          <span className="navbar-link" onClick={() => setShowLogoutConfirm(true)} style={{ cursor: 'pointer' }}>
            Đăng Xuất
          </span>
        </div>
      </nav>

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
            <p style={{ marginBottom: '24px' }}>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</p>
            <div className="flex gap-2 justify-center">
              <button
                className="btn btn-danger"
                onClick={handleLogout}
                style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ĐĂNG XUẤT
              </button>
              <button
                className="btn"
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#000', border: '2px solid #0a0a0a', cursor: 'pointer', fontWeight: 'bold' }}
              >
                HỦY
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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