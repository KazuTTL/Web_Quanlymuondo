import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyHistory } from '../../services/api'
import dayjs from 'dayjs'

function StudentHistory() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const res = await getMyHistory()
      setRecords(res.data?.data || res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status) => {
    const tags = {
      borrowed: { text: 'Đang mượn', class: 'tag-pending' },
      returned: { text: 'Đã trả', class: 'tag-approved' },
      overdue: { text: 'Quá hạn', class: 'tag-overdue' }
    }
    return tags[status] || { text: status, class: '' }
  }

  return (
    <div>
      <div className="navbar">
        <Link to="/" className="navbar-brand">LendHub</Link>
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Trang Chủ</Link>
          <Link to="/devices" className="navbar-link">Thiết Bị</Link>
          <Link to="/my-requests" className="navbar-link">Yêu Cầu</Link>
          <Link to="/history" className="navbar-link active">Lịch Sử</Link>
        </div>
      </div>

      <div className="container">
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '24px' }}>
          Lịch Sử Mượn Trả
        </h1>

        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : records.length === 0 ? (
          <div className="empty">
            <p>Chưa có lịch sử mượn</p>
            <Link to="/devices">
              <button className="btn btn-primary mt-4">MƯỢN THIẾT BỊ</button>
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Thiết Bị</th>
                <th>Số Lượng</th>
                <th>Ngày Mượn</th>
                <th>Ngày Trả Dự Kiến</th>
                <th>Ngày Trả Thực Tế</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const status = getStatusTag(record.status || record.TrangThai)
                return (
                  <tr key={record._id || record.RecordID}>
                    <td>{record.device?.name || record.TenThietBi}</td>
                    <td>{record.quantity || record.SoLuongMuon}</td>
                    <td>{dayjs(record.borrowDate || record.NgayMuon).format('DD/MM/YYYY')}</td>
                    <td>{dayjs(record.returnDate || record.NgayTraDuKien).format('DD/MM/YYYY')}</td>
                    <td>{record.returnedAt ? dayjs(record.returnedAt).format('DD/MM/YYYY') : '-'}</td>
                    <td><span className={`tag ${status.class}`}>{status.text}</span></td>
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