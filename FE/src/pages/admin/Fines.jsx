import { useState, useEffect } from 'react'
import { getFinesAdmin, processFinesAdmin } from '../../services/api'
import dayjs from 'dayjs'
import { Landmark, RefreshCw } from 'lucide-react'

function AdminFines() {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [finePerDay, setFinePerDay] = useState(5000)

  useEffect(() => {
    loadFines()
  }, [])

  const loadFines = async () => {
    try {
      const res = await getFinesAdmin()
      const data = res.data?.data || res.data || []
      setFines(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Không tải được danh sách tiền phạt')
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async () => {
    setError('')
    setSuccess('')
    setProcessing(true)
    try {
      await processFinesAdmin(finePerDay)
      setSuccess('Đã thực thi chạy stored procedure xử lý phạt quá hạn tự động thành công!')
      loadFines()
    } catch (err) {
      console.error(err)
      setError('Lỗi khi chạy xử lý phạt quá hạn')
    } finally {
      setProcessing(false)
    }
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', margin: 0, fontWeight: '800' }}>
          Quản Lý Tiền Phạt
        </h1>
        
        {/* Nút tác vụ xử lý phạt tự động */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="input-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="input-label" style={{ margin: 0 }}>Mức phạt/ngày:</span>
            <input 
              type="number" 
              className="input" 
              style={{ width: '100px', padding: '6px 12px' }}
              value={finePerDay}
              onChange={(e) => setFinePerDay(Number(e.target.value))}
            />
          </div>
          <button 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
            onClick={handleProcess}
            disabled={processing}
          >
            <RefreshCw size={16} className={processing ? 'animate-spin' : ''} />
            <span>TÍNH PHẠT TỰ ĐỘNG</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      {loading ? (
        <div className="loading">ĐANG TẢI...</div>
      ) : fines.length === 0 ? (
        <div className="empty">
          <p>Hiện không có khoản phạt nào trong hệ thống</p>
        </div>
      ) : (
        <div className="card">
          <h3 className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Landmark size={20} /> Danh Sách Khoản Phạt Chi Tiết
          </h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Sinh Viên</th>
                  <th>Username</th>
                  <th>Thiết Bị</th>
                  <th>Số Tiền</th>
                  <th>Lý Do</th>
                  <th>Ngày Phạt</th>
                  <th>Hạn Thanh Toán</th>
                  <th>Ngày Thanh Toán</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine) => (
                  <tr key={fine.FineID}>
                    <td>{fine.StudentName}</td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', border: '1px solid #cbd5e1' }}>{fine.Username}</code></td>
                    <td>{fine.DeviceName || 'Hệ thống / Thiết bị khác'}</td>
                    <td style={{ fontWeight: 'bold', color: fine.TrangThai === 'da_thanh_toan' ? '#16a34a' : '#ef4444' }}>
                      {formatMoney(fine.SoTien)}
                    </td>
                    <td>{fine.LyDo}</td>
                    <td>{dayjs(fine.NgayPhat).format('DD/MM/YYYY')}</td>
                    <td>{fine.HanThanhToan ? dayjs(fine.HanThanhToan).format('DD/MM/YYYY') : '-'}</td>
                    <td>{fine.NgayThanhToan ? dayjs(fine.NgayThanhToan).format('DD/MM/YYYY HH:mm') : '-'}</td>
                    <td>
                      <span className={`tag ${fine.TrangThai === 'da_thanh_toan' ? 'tag-approved' : 'tag-overdue'}`}>
                        {fine.TrangThai === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminFines
