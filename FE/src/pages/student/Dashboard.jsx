import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../App'
import StudentNavbar from '../../components/StudentNavbar'
import { Hand, Package, ClipboardList, History, User, Landmark } from 'lucide-react'

function StudentDashboard() {
  const { user } = useContext(AuthContext)

  return (
    <div>
      <StudentNavbar />
      <div className="container">
        <h1 style={{ fontSize: '32px', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Xin Chào, {user?.name || 'Sinh Viên'} <Hand size={32} />
        </h1>

        <div className="grid grid-cols-3 gap-4">
          <Link to="/devices" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={20} /> Thiết Bị</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>
              Xem danh sách thiết bị có sẵn và đăng ký mượn
            </p>
          </Link>

          <Link to="/my-requests" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} /> Yêu Cầu Của Tôi</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>
              Theo dõi trạng thái yêu cầu mượn
            </p>
          </Link>

          <Link to="/history" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><History size={20} /> Lịch Sử</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>
              Xem toàn bộ lịch sử mượn trả
            </p>
          </Link>

          <Link to="/fines" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Landmark size={20} /> Tiền Phạt</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>
              Xem các khoản phạt quá hạn và thanh toán
            </p>
          </Link>

          <Link to="/profile" className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} /> Hồ Sơ</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>
              Cập nhật thông tin cá nhân
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard