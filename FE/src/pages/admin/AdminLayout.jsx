import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useState, useContext } from 'react'
import { AuthContext } from '../../App'
import { logout as apiLogout } from '../../services/api'
import { LayoutDashboard, ClipboardList, Package, LineChart, LogOut, Hand } from 'lucide-react'

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* SIDEBAR */}
      <div style={{
        width: '280px',
        backgroundColor: '#fff',
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        borderRight: '3px solid #0a0a0a',
        zIndex: 100
      }}>
        <div style={{
          padding: '24px',
          fontSize: '22px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          borderBottom: '3px solid #0a0a0a',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ backgroundColor: '#ef4444', width: '32px', height: '32px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', border: '2px solid #0a0a0a' }}>L</div>
          <span>LendHub <span style={{ color: '#ef4444' }}>ADMIN</span></span>
        </div>
        
        <div style={{ flex: 1, padding: '20px 12px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/admin" className="sidebar-link-custom" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#000',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              border: '2px solid transparent',
              transition: 'all 0.1s'
            }}
            onMouseEnter={(e) => { e.target.style.border = '2px solid #0a0a0a'; e.target.style.boxShadow = '3px 3px 0 #0a0a0a'; }}
            onMouseLeave={(e) => { e.target.style.border = '2px solid transparent'; e.target.style.boxShadow = 'none'; }}
            >
              <LayoutDashboard size={18} /><span>Dashboard</span>
            </Link>
            <Link to="/admin/requests" className="sidebar-link-custom" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#000',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              border: '2px solid transparent',
              transition: 'all 0.1s'
            }}
            onMouseEnter={(e) => { e.target.style.border = '2px solid #0a0a0a'; e.target.style.boxShadow = '3px 3px 0 #0a0a0a'; }}
            onMouseLeave={(e) => { e.target.style.border = '2px solid transparent'; e.target.style.boxShadow = 'none'; }}
            >
              <ClipboardList size={18} /><span>Yêu Cầu Mượn</span>
            </Link>
            <Link to="/admin/devices" className="sidebar-link-custom" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#000',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              border: '2px solid transparent',
              transition: 'all 0.1s'
            }}
            onMouseEnter={(e) => { e.target.style.border = '2px solid #0a0a0a'; e.target.style.boxShadow = '3px 3px 0 #0a0a0a'; }}
            onMouseLeave={(e) => { e.target.style.border = '2px solid transparent'; e.target.style.boxShadow = 'none'; }}
            >
              <Package size={18} /><span>Quản Lý Thiết Bị</span>
            </Link>
            <Link to="/admin/statistics" className="sidebar-link-custom" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#000',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              border: '2px solid transparent',
              transition: 'all 0.1s'
            }}
            onMouseEnter={(e) => { e.target.style.border = '2px solid #0a0a0a'; e.target.style.boxShadow = '3px 3px 0 #0a0a0a'; }}
            onMouseLeave={(e) => { e.target.style.border = '2px solid transparent'; e.target.style.boxShadow = 'none'; }}
            >
              <LineChart size={18} /><span>Thống Kê</span>
            </Link>
          </nav>
        </div>

        <div style={{ padding: '20px', borderTop: '3px solid #0a0a0a', backgroundColor: '#f9fafb' }}>
          <div style={{ marginBottom: '16px', padding: '0 12px' }}>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textTransform: 'uppercase', fontWeight: '700' }}>Quản trị viên</p>
            <p style={{ fontSize: '14px', color: '#000', fontWeight: '800', margin: '4px 0 0 0' }}>{user?.name || 'Admin'}</p>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#fff',
              color: '#ef4444',
              border: '2px solid #0a0a0a',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '14px',
              transition: 'all 0.1s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '3px 3px 0 #0a0a0a'
            }}
            onMouseOver={(e) => { e.target.style.backgroundColor = '#ef4444'; e.target.style.color = '#fff'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#ef4444'; }}
          >
            <LogOut size={16} /><span>Đăng Xuất</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '64px',
          backgroundColor: '#fff',
          borderBottom: '3px solid #0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#000', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Bảng Điều Khiển Quản Trị
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#f1f5f9', border: '2px solid #0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#000' }}>
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
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', border: '3px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
            padding: '32px', minWidth: '340px', maxWidth: '420px', width: '90%', textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Hand size={48} color="#000" /></div>
            <div style={{
              fontWeight: '800', fontSize: '20px', color: '#000', marginBottom: '12px', textTransform: 'uppercase'
            }}>Xác Nhận Đăng Xuất</div>
            <p style={{ color: '#475569', marginBottom: '24px', lineHeight: '1.5', fontWeight: '500' }}>Bạn có chắc chắn muốn thoát khỏi phiên làm việc quản trị hiện tại?</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#000', border: '2px solid #0a0a0a', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', transition: 'all 0.1s', boxShadow: '3px 3px 0 #0a0a0a' }}
                onMouseOver={(e) => { e.target.style.backgroundColor = '#f1f5f9'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = '#fff'; }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleLogout}
                style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: '#fff', border: '2px solid #0a0a0a', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', transition: 'all 0.1s', boxShadow: '3px 3px 0 #0a0a0a' }}
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

