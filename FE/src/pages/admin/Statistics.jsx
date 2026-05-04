import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStatistics } from '../../services/api'
import dayjs from 'dayjs'

function AdminStatistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await getStatistics()
      setStats(res.data || {})
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
          Thống Kê - Tháng {dayjs().format('MM/YYYY')}
        </h1>


        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="card">
              <h3 className="card-header">Tổng Quan</h3>
              <p><strong>Tổng lượt mượn:</strong> {stats?.totalBorrows || 0}</p>
              <p><strong>Tổng sinh viên mượn:</strong> {stats?.totalUsers || 0}</p>
              <p><strong>Tổng số lượng:</strong> {stats?.totalQuantity || 0}</p>
            </div>

            <div className="card">
              <h3 className="card-header">Thiết Bị Mượn Nhiều Nhất</h3>
              {stats?.topDevices?.length > 0 ? (
                <table className="table" style={{ marginTop: '8px' }}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Thiết Bị</th>
                      <th>Số Lần</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topDevices.slice(0, 5).map((device, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{device.TenThietBi}</td>
                        <td>{device.SoLanMuon}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Chưa có dữ liệu</p>
              )}
            </div>

            <div className="card">
              <h3 className="card-header">Thiết Bị Theo Danh Mục</h3>
              {stats?.byCategory?.length > 0 ? (
                <table className="table" style={{ marginTop: '8px' }}>
                  <thead>
                    <tr>
                      <th>Danh Mục</th>
                      <th>Số Lần</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byCategory.map((cat, index) => (
                      <tr key={index}>
                        <td>{cat.DanhMuc}</td>
                        <td>{cat.SoLanMuon}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        )}

        <div className="card mt-6">
          <h3 className="card-header">Thiết Bị Quá Hạn</h3>
          {stats?.overdueDevices?.length > 0 ? (
            <table className="table" style={{ marginTop: '8px' }}>
              <thead>
                <tr>
                  <th>Người Mượn</th>
                  <th>Thiết Bị</th>
                  <th>Ngày Trả Dự Kiến</th>
                  <th>Số Ngày Quá Hạn</th>
                </tr>
              </thead>
              <tbody>
                {stats.overdueDevices.map((device, index) => (
                  <tr key={index}>
                    <td>{device.TenSinhVien}</td>
                    <td>{device.TenThietBi}</td>
                    <td>{dayjs(device.NgayTraDuKien).format('DD/MM/YYYY')}</td>
                    <td className="tag tag-overdue">{device.SoNgayQuaHan} ngày</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ padding: '16px', color: 'var(--gray)' }}>Không có thiết bị quá hạn</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminStatistics