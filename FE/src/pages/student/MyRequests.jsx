import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyBorrowRequests, getDeviceById } from '../../services/api'
import dayjs from 'dayjs'

function StudentMyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const res = await getMyBorrowRequests()
      setRequests(res.data?.data || res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status) => {
    const tags = {
      pending: { text: 'Chờ duyệt', class: 'tag-pending' },
      approved: { text: 'Đã duyệt', class: 'tag-approved' },
      rejected: { text: 'Từ chối', class: 'tag-rejected' }
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
          <Link to="/my-requests" className="navbar-link active">Yêu Cầu</Link>
          <Link to="/history" className="navbar-link">Lịch Sử</Link>
        </div>
      </div>

      <div className="container">
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '24px' }}>
          Yêu Cầu Của Tôi
        </h1>

        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : requests.length === 0 ? (
          <div className="empty">
            <p>Chưa có yêu cầu nào</p>
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
                <th>Ngày Trả</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const status = getStatusTag(req.status || req.TrangThai)
                return (
                  <tr key={req._id || req.RequestID}>
                    <td>{req.device?.name || req.TenThietBi}</td>
                    <td>{req.quantity || req.SoLuongMuon}</td>
                    <td>{dayjs(req.borrowDate || req.NgayMuon).format('DD/MM/YYYY')}</td>
                    <td>{dayjs(req.returnDate || req.NgayTraDuKien).format('DD/MM/YYYY')}</td>
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

export default StudentMyRequests