import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../App'
import { logout, getStatistics } from '../../services/api'

function AdminDashboard() {
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await getStatistics()
      // API trả về { data: { kpis: { totalDevices, ... } } }
      const payload = res.data?.data
      const kpis = payload?.kpis || payload || {}
      setStats(kpis)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="container">
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '24px' }}>
          Dashboard - Quản Trị Viên
        </h1>


        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <div className="card text-center">
              <p style={{ fontSize: '12px', textTransform: 'uppercase' }}>Tổng Thiết Bị</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalDevices || 0}</p>
            </div>

            <div className="card text-center">
              <p style={{ fontSize: '12px', textTransform: 'uppercase' }}>Chờ Duyệt</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--warning)' }}>
                {stats.pendingRequests || 0}
              </p>
            </div>

            <div className="card text-center">
              <p style={{ fontSize: '12px', textTransform: 'uppercase' }}>Đang Mượn</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--info)' }}>
                {stats.borrowedDevices || 0}
              </p>
            </div>

            <div className="card text-center">
              <p style={{ fontSize: '12px', textTransform: 'uppercase' }}>Bảo Trì</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--warning)' }}>
                {stats.maintenanceDevices || 0}
              </p>
            </div>

            <div className="card text-center">
              <p style={{ fontSize: '12px', textTransform: 'uppercase' }}>Quá Hạn</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--danger)' }}>
                {stats.overdueDevices || 0}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6">
          <Link to="/admin/requests" className="card" style={{ textDecoration: 'none' }}>
            <h3>📋 Quản Lý Yêu Cầu</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>Duyệt/từ chối yêu cầu mượn</p>
          </Link>

          <Link to="/admin/devices" className="card" style={{ textDecoration: 'none' }}>
            <h3>📦 Quản Lý Thiết Bị</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>Thêm/sửa/xóa thiết bị</p>
          </Link>

          <Link to="/admin/statistics" className="card" style={{ textDecoration: 'none' }}>
            <h3>📊 Thống Kê</h3>
            <p style={{ color: 'var(--gray)', marginTop: '8px' }}>Báo cáo thiết bị mượn nhiều</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard