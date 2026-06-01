import { useState, useEffect } from 'react'
import { getMyFines, payFine } from '../../services/api'
import StudentNavbar from '../../components/StudentNavbar'
import dayjs from 'dayjs'

function StudentFines() {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadFines()
  }, [])

  const loadFines = async () => {
    try {
      const res = await getMyFines()
      const data = res.data?.data || res.data || []
      setFines(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Không tải được danh sách tiền phạt')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (id) => {
    setError('')
    setSuccess('')
    try {
      await payFine(id)
      setSuccess('Thanh toán tiền phạt thành công!')
      loadFines()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán')
    }
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div>
      <StudentNavbar />
      <div className="container">
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '24px' }}>
          Các Khoản Phạt Của Bạn
        </h1>

        {error && <div className="alert alert-error mb-4">{error}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}

        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : fines.length === 0 ? (
          <div className="empty">
            <p>Bạn không có khoản phạt nào cần xử lý</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Thiết Bị</th>
                  <th>Số Tiền</th>
                  <th>Lý Do</th>
                  <th>Ngày Phạt</th>
                  <th>Hạn Thanh Toán</th>
                  <th>Ngày Thanh Toán</th>
                  <th>Trạng Thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine) => (
                  <tr key={fine.FineID}>
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
                    <td>
                      {fine.TrangThai !== 'da_thanh_toan' ? (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handlePay(fine.FineID)}
                        >
                          THANH TOÁN
                        </button>
                      ) : (
                        <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 'bold' }}>HOÀN TẤT</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentFines
