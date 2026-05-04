import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useState, useContext } from 'react'
import { AuthContext } from '../../App'
import { logout as apiLogout } from '../../services/api'

function AdminLayout() {
  const { user, logout: authLogout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = async () => {
    try {
      await apiLogout()
      authLogout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* SIDEBAR */}
      <div style={{
        width: '280px',
        backgroundColor: '#1e293b', // slate-800
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <div style={{
          padding: '24px',
          fontSize: '22px',
          fontWeight: '800',
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid #334155',
          backgroundColor: '#0f172a'
        }}>
          <div style={{ backgroundColor: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px' }}>L</div>
          <span>LendHub <span style={{ color: '#ef4444' }}>ADMIN</span></span>
        </div>
        
        <div style={{ flex: 1, padding: '20px 12px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/admin" className="sidebar-link-custom" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#cbd5e1',
              textDecoration: 'none',
              transition: 'all 0.2s',
              fontWeight: '500',
              fontSize: '15px'
            }}>
              <span>📊 Dashboard</span>
            </Link>
            <Link to="/admin/requests" className="sidebar-link-custom" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#cbd5e1',
              textDecoration: 'none',
              transition: 'all 0.2s',
              fontWeight: '500',
              fontSize: '15px'
            }}>
              <span>📋 Yêu Cầu Mượn</span>
            </Link>
            <Link to="/admin/devices" className="sidebar-link-custom" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#cbd5e1',
              textDecoration: 'none',
              transition: 'all 0.2s',
              fontWeight: '500',
              fontSize: '15px'
            }}>
              <span>📦 Quản Lý Thiết Bị</span>
            </Link>
            <Link to="/admin/statistics" className="sidebar-link-custom" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#cbd5e1',
              textDecoration: 'none',
              transition: 'all 0.2s',
              fontWeight: '500',
              fontSize: '15px'
            }}>
              <span>📈 Thống Kê</span>
            </Link>
          </nav>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #334155', backgroundColor: '#0f172a' }}>
          <div style={{ marginBottom: '16px', padding: '0 12px' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, textTransform: 'uppercase', fontWeight: '600' }}>Quản trị viên</p>
            <p style={{ fontSize: '14px', color: '#fff', fontWeight: '600', margin: '4px 0 0 0' }}>{user?.name || 'Admin'}</p>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => { e.target.style.backgroundColor = '#ef4444'; e.target.style.color = '#fff'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.target.style.color = '#ef4444'; }}
          >
            <span>🚪 Đăng Xuất</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '64px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Bảng Điều Khiển Quản Trị
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <main style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '32px', minWidth: '340px', maxWidth: '420px', width: '90%', textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
            <div style={{
              fontWeight: '700', fontSize: '20px', color: '#1e293b', marginBottom: '12px'
            }}>Xác Nhận Đăng Xuất</div>
            <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>Bạn có chắc chắn muốn thoát khỏi phiên làm việc quản trị hiện tại?</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.target.style.backgroundColor = '#e2e8f0'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = '#f1f5f9'; }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleLogout}
                style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)' }}
                onMouseOver={(e) => { e.target.style.backgroundColor = '#dc2626'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = '#ef4444'; }}
              >
                Đăng xuất ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLayout

