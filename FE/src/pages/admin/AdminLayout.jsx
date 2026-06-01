import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useContext } from 'react'
import { AuthContext } from '../../App'
import { logout as apiLogout } from '../../services/api'
import { LayoutDashboard, ClipboardList, Package, LineChart, LogOut, Hand, Landmark, ChevronLeft, ChevronRight, Menu } from 'lucide-react'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/requests', icon: ClipboardList, label: 'Yêu Cầu Mượn' },
  { to: '/admin/devices', icon: Package, label: 'Quản Lý Thiết Bị' },
  { to: '/admin/statistics', icon: LineChart, label: 'Thống Kê' },
  { to: '/admin/fines', icon: Landmark, label: 'Quản Lý Phạt' },
]

function SidebarNavItem({ item, collapsed, location }) {
  const isActive = item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to)

  const Icon = item.icon

  return (
    <div style={{ position: 'relative' }} className="sidebar-nav-item-wrapper">
      <Link
        to={item.to}
        title={collapsed ? item.label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? '0' : '12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '12px' : '12px 16px',
          borderRadius: '8px',
          color: isActive ? '#ef4444' : '#000',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '15px',
          border: isActive ? '2px solid #0a0a0a' : '2px solid transparent',
          boxShadow: isActive ? '3px 3px 0 #0a0a0a' : 'none',
          backgroundColor: isActive ? '#fff7f7' : 'transparent',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.border = '2px solid #0a0a0a'
            e.currentTarget.style.boxShadow = '3px 3px 0 #0a0a0a'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.border = '2px solid transparent'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      >
        <Icon size={18} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <span style={{
            opacity: collapsed ? 0 : 1,
            transition: 'opacity 0.2s',
            overflow: 'hidden',
          }}>
            {item.label}
          </span>
        )}
      </Link>

      {/* Tooltip khi thu gọn */}
      {collapsed && (
        <div style={{
          position: 'absolute',
          left: 'calc(100% + 12px)',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: '#0a0a0a',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 999,
          boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
          opacity: 0,
          transition: 'opacity 0.15s ease',
        }}
          className="sidebar-tooltip"
        >
          {item.label}
          <div style={{
            position: 'absolute',
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            border: '5px solid transparent',
            borderRightColor: '#0a0a0a',
          }} />
        </div>
      )}
    </div>
  )
}

function AdminLayout() {
  const { user, logout: authLogout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const SIDEBAR_W = collapsed ? '72px' : '280px'

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
    <>
      {/* Tooltip CSS injection */}
      <style>{`
        .sidebar-nav-item-wrapper:hover .sidebar-tooltip {
          opacity: 1 !important;
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* SIDEBAR */}
        <div style={{
          width: SIDEBAR_W,
          backgroundColor: '#fff',
          color: '#000',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          borderRight: '3px solid #0a0a0a',
          zIndex: 100,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: collapsed ? '20px 0' : '20px 24px',
            fontSize: '22px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            borderBottom: '3px solid #0a0a0a',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: '12px',
            minHeight: '72px',
            transition: 'padding 0.25s',
          }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <div style={{
                  backgroundColor: '#ef4444',
                  width: '32px', height: '32px',
                  borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '16px', fontWeight: 'bold',
                  border: '2px solid #0a0a0a',
                  flexShrink: 0,
                }}>L</div>
                <span style={{ whiteSpace: 'nowrap', fontSize: '18px' }}>
                  LendHub <span style={{ color: '#ef4444' }}>ADMIN</span>
                </span>
              </div>
            )}

            {collapsed && (
              <div style={{
                backgroundColor: '#ef4444',
                width: '36px', height: '36px',
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '18px', fontWeight: 'bold',
                border: '2px solid #0a0a0a',
              }}>L</div>
            )}

            {/* Toggle button */}
            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                title="Thu gọn sidebar"
                style={{
                  background: 'none',
                  border: '2px solid #0a0a0a',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000',
                  boxShadow: '2px 2px 0 #0a0a0a',
                  transition: 'all 0.1s',
                  flexShrink: 0,
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9' }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Nav items */}
          <div style={{ flex: 1, padding: collapsed ? '16px 8px' : '20px 12px', overflow: 'hidden' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navItems.map(item => (
                <SidebarNavItem
                  key={item.to}
                  item={item}
                  collapsed={collapsed}
                  location={location}
                />
              ))}
            </nav>
          </div>

          {/* Bottom: user info + logout */}
          <div style={{
            padding: collapsed ? '16px 8px' : '20px',
            borderTop: '3px solid #0a0a0a',
            backgroundColor: '#f9fafb',
          }}>
            {!collapsed && (
              <div style={{ marginBottom: '12px', padding: '0 12px' }}>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textTransform: 'uppercase', fontWeight: '700' }}>Quản trị viên</p>
                <p style={{ fontSize: '14px', color: '#000', fontWeight: '800', margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</p>
              </div>
            )}

            {/* Logout button */}
            <div style={{ position: 'relative' }} className="sidebar-nav-item-wrapper">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                title={collapsed ? 'Đăng Xuất' : undefined}
                style={{
                  width: '100%',
                  padding: collapsed ? '10px' : '10px',
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
                  justifyContent: collapsed ? 'center' : 'center',
                  gap: collapsed ? '0' : '8px',
                  boxShadow: '3px 3px 0 #0a0a0a',
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2' }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff' }}
              >
                <LogOut size={16} style={{ flexShrink: 0 }} />
                {!collapsed && <span>Đăng Xuất</span>}
              </button>

              {collapsed && (
                <div style={{
                  position: 'absolute',
                  left: 'calc(100% + 12px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#0a0a0a',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 999,
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                  opacity: 0,
                  transition: 'opacity 0.15s ease',
                }}
                  className="sidebar-tooltip"
                >
                  Đăng Xuất
                  <div style={{
                    position: 'absolute',
                    right: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: '5px solid transparent',
                    borderRightColor: '#0a0a0a',
                  }} />
                </div>
              )}
            </div>

            {/* Expand button khi collapsed */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                title="Mở rộng sidebar"
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '8px',
                  background: 'none',
                  border: '2px solid #0a0a0a',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000',
                  boxShadow: '2px 2px 0 #0a0a0a',
                  transition: 'all 0.1s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9' }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ marginLeft: SIDEBAR_W, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
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
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#000', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Bảng Điều Khiển Quản Trị
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '4px',
                backgroundColor: '#f1f5f9',
                border: '2px solid #0a0a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 'bold', color: '#000',
              }}>
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
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
          }}>
            <div style={{
              background: '#fff', border: '3px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
              padding: '32px', minWidth: '340px', maxWidth: '420px', width: '90%', textAlign: 'center',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><Hand size={48} color="#000" /></div>
              <div style={{ fontWeight: '800', fontSize: '20px', color: '#000', marginBottom: '12px', textTransform: 'uppercase' }}>
                Xác Nhận Đăng Xuất
              </div>
              <p style={{ color: '#475569', marginBottom: '24px', lineHeight: '1.5', fontWeight: '500' }}>
                Bạn có chắc chắn muốn thoát khỏi phiên làm việc quản trị hiện tại?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#000', border: '2px solid #0a0a0a', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', transition: 'all 0.1s', boxShadow: '3px 3px 0 #0a0a0a' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9' }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff' }}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleLogout}
                  style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: '#fff', border: '2px solid #0a0a0a', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', transition: 'all 0.1s', boxShadow: '3px 3px 0 #0a0a0a' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc2626' }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ef4444' }}
                >
                  Đăng xuất ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminLayout
