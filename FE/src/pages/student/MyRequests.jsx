import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyBorrowRequests, getMyNotifications, markNotificationRead } from '../../services/api'
import dayjs from 'dayjs'

function StudentMyRequests() {
  const [requests, setRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    loadRequests()
    loadNotifications()
  }, [])

  const loadRequests = async () => {
    try {
      const res = await getMyBorrowRequests()
      setRequests(res.data?.data?.data || res.data?.data || res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    try {
      const res = await getMyNotifications()
      setNotifications(res.data?.data || res.data || [])
    } catch (err) {
      // Không bắt buộc phải hiện lỗi thông báo
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.NotificationID === id ? { ...n, IsRead: 1 } : n))
    } catch (err) {}
  }

  const unreadCount = notifications.filter(n => !n.IsRead).length

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
          <Link to="/profile" className="navbar-link">Hồ Sơ</Link>
          {/* Chuông thông báo */}
          <button
            className="navbar-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px 8px' }}
            onClick={() => setShowNotif(!showNotif)}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#ef4444', color: '#fff', borderRadius: '50%',
                width: '18px', height: '18px', fontSize: '11px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold'
              }}>{unreadCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown thông báo */}
      {showNotif && (
        <div style={{
          position: 'fixed', top: '60px', right: '16px', zIndex: 999,
          background: '#fff', border: '2px solid #0a0a0a', boxShadow: '4px 4px 0 #0a0a0a',
          width: '340px', maxHeight: '400px', overflowY: 'auto'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '2px solid #0a0a0a', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>Thông báo</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} onClick={() => setShowNotif(false)}>✕</button>
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Không có thông báo</div>
          ) : (
            notifications.map(n => (
              <div
                key={n.NotificationID}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e5e7eb',
                  background: n.IsRead ? '#fff' : '#f0f9ff',
                  cursor: n.IsRead ? 'default' : 'pointer'
                }}
                onClick={() => !n.IsRead && handleMarkRead(n.NotificationID)}
              >
                <p style={{ fontWeight: n.IsRead ? 'normal' : 'bold', fontSize: '13px', marginBottom: '4px' }}>{n.Title}</p>
                <p style={{ fontSize: '12px', color: '#4b5563' }}>{n.Content}</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  {dayjs(n.NgayTao).format('DD/MM/YYYY HH:mm')}
                  {!n.IsRead && <span style={{ color: '#3b82f6', marginLeft: '8px' }}>● Chưa đọc</span>}
                </p>
              </div>
            ))
          )}
        </div>
      )}

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
                  <tr key={req._id || req.id || req.RequestID}>
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