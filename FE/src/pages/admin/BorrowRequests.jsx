import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllBorrowRequestsAdmin, approveRequest, rejectRequest, returnDevice } from '../../services/api'
import dayjs from 'dayjs'

function AdminBorrowRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    loadRequests()
  }, [filter])

  const loadRequests = async () => {
    try {
      const res = await getAllBorrowRequestsAdmin({ status: filter })
      setRequests(res.data?.data || res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    if (window.confirm('Duyệt yêu cầu này?')) {
      try {
        await approveRequest(id)
        loadRequests()
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi')
      }
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Lý do từ chối:')
    if (reason !== null) {
      try {
        await rejectRequest(id, reason)
        loadRequests()
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi')
      }
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
        <Link to="/admin" className="navbar-brand">LendHub ADMIN</Link>
        <div className="navbar-menu">
          <Link to="/admin" className="navbar-link">Dashboard</Link>
          <Link to="/admin/requests" className="navbar-link active">Yêu Cầu</Link>
          <Link to="/admin/devices" className="navbar-link">Thiết Bị</Link>
          <Link to="/admin/statistics" className="navbar-link">Thống Kê</Link>
        </div>
      </div>

      <div className="container">
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '24px' }}>
          Quản Lý Yêu Cầu Mượn
        </h1>

        <div className="flex gap-2 mb-4">
          <button className={`btn ${filter === 'pending' ? 'btn-primary' : ''}`} onClick={() => setFilter('pending')}>
            Chờ Duyệt
          </button>
          <button className={`btn ${filter === 'approved' ? 'btn-primary' : ''}`} onClick={() => setFilter('approved')}>
            Đã Duyệt
          </button>
          <button className={`btn ${filter === 'rejected' ? 'btn-primary' : ''}`} onClick={() => setFilter('rejected')}>
            Đã Từ Chối
          </button>
        </div>

        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : requests.length === 0 ? (
          <div className="empty">Không có yêu cầu nào</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Người Mượn</th>
                <th>Thiết Bị</th>
                <th>Số Lượng</th>
                <th>Ngày Mượn</th>
                <th>Ngày Trả</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const status = getStatusTag(req.status || req.TrangThai)
                return (
                  <tr key={req._id || req.RequestID}>
                    <td>{req.user?.name || req.TenSinhVien}</td>
                    <td>{req.device?.name || req.TenThietBi}</td>
                    <td>{req.quantity || req.SoLuongMuon}</td>
                    <td>{dayjs(req.borrowDate || req.NgayMuon).format('DD/MM/YYYY')}</td>
                    <td>{dayjs(req.returnDate || req.NgayTraDuKien).format('DD/MM/YYYY')}</td>
                    <td><span className={`tag ${status.class}`}>{status.text}</span></td>
                    <td>
                      {(req.status || req.TrangThai) === 'pending' && (
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(req._id || req.RequestID)}>
                            Duyệt
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleReject(req._id || req.RequestID)}>
                            Từ Chối
                          </button>
                        </div>
                      )}
                      {(req.status || req.TrangThai) === 'approved' && (
                        <button className="btn btn-sm" onClick={() => handleReturn(req._id || req.RequestID)}>
                          Xác Nhận Trả
                        </button>
                      )}
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

export default AdminBorrowRequests