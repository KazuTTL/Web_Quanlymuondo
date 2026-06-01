import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyHistory } from '../../services/api'
import StudentNavbar from '../../components/StudentNavbar'
import dayjs from 'dayjs'

function StudentHistory() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const res = await getMyHistory()
      // API trả về { message: '...', data: [...] }
      const data = res.data?.data || res.data || []
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Không tải được lịch sử mượn trả')
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status, statusText) => {
    // Ưu tiên dùng TinhTrangHienTai từ view DB
    if (statusText === 'Đã trả') return { text: 'Đã Trả', class: 'tag-returned' }
    if (statusText === 'Quá hạn') return { text: 'Quá Hạn', class: 'tag-overdue' }
    
    const tags = {
      borrowed: { text: 'Đang Mượn', class: 'tag-pending' },
      returned: { text: 'Đã Trả', class: 'tag-returned' },
      overdue: { text: 'Quá Hạn', class: 'tag-overdue' }
    }
    return tags[status] || { text: status || 'N/A', class: '' }
  }

  return (
    <div>
      <StudentNavbar />
      <div className="container">
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '24px' }}>
          Lịch Sử Mượn Trả
        </h1>

        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : records.length === 0 ? (
          <div className="empty">
            <p>Chưa có lịch sử mượn trả</p>
            <Link to="/devices">
              <button className="btn btn-primary mt-4">MƯỢN THIẾT BỊ</button>
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Thiết Bị</th>
                <th>Danh Mục</th>
                <th>Số Lượng</th>
                <th>Ngày Mượn</th>
                <th>Ngày Trả DK</th>
                <th>Ngày Trả TT</th>
                <th>Trạng Thái</th>
                <th>Quá Hạn</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const status = getStatusTag(record.status || record.TrangThai, record.statusText || record.TinhTrangHienTai)
                return (
                  <tr key={record.id || record.RecordID}>
                    <td>{record.deviceName || record.TenThietBi}</td>
                    <td>{record.category || record.DanhMuc}</td>
                    <td>{record.quantity || record.SoLuongMuon}</td>
                    <td>{record.borrowDate ? dayjs(record.borrowDate).format('DD/MM/YYYY') : '-'}</td>
                    <td>{record.returnDate ? dayjs(record.returnDate).format('DD/MM/YYYY') : '-'}</td>
                    <td>{record.returnedAt ? dayjs(record.returnedAt).format('DD/MM/YYYY') : '-'}</td>
                    <td><span className={`tag ${status.class}`}>{status.text}</span></td>
                    <td>
                      {(record.overdueDays || record.SoNgayQuaHan) > 0 ? (
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                          +{record.overdueDays || record.SoNgayQuaHan} ngày
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default StudentHistory