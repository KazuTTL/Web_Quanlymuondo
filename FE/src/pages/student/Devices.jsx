import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDevices } from '../../services/api'

function StudentDevices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      const res = await getDevices({ keyword: search })
      setDevices(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status) => {
    const tags = {
      available: { text: 'Sẵn sàng', class: 'tag-approved' },
      borrowed: { text: 'Đang mượn', class: 'tag-pending' },
      maintenance: { text: 'Bảo trì', class: 'tag-pending' }
    }
    return tags[status] || { text: status, class: '' }
  }

  return (
    <div>
      <div className="navbar">
        <Link to="/" className="navbar-brand">LendHub</Link>
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Trang Chủ</Link>
          <Link to="/devices" className="navbar-link active">Thiết Bị</Link>
          <Link to="/my-requests" className="navbar-link">Yêu Cầu</Link>
          <Link to="/history" className="navbar-link">Lịch Sử</Link>
        </div>
      </div>

      <div className="container">
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '24px' }}>
          Danh Sách Thiết Bị
        </h1>

        <div className="input-group" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            className="input"
            placeholder="Tìm kiếm thiết bị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadDevices()}
          />
        </div>

        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : devices.length === 0 ? (
          <div className="empty">Không có thiết bị nào</div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {devices.map((device) => {
              const status = getStatusTag(device.status)
              return (
                <div key={device.id} className="card">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`tag ${status.class}`}>{status.text}</span>
                    <span style={{ fontWeight: 'bold' }}>SL: {device.availableQuantity || device.quantity}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{device.name}</h3>
                  <p style={{ color: 'var(--gray)', fontSize: '12px' }}>{device.serialNumber}</p>
                  <p style={{ marginTop: '8px', fontSize: '12px' }}>{device.category}</p>
                  
                  {device.availableQuantity > 0 ? (
                    <Link to={`/borrow/${device.id}`}>
                      <button className="btn btn-primary btn-block mt-4">MƯỢN NGAY</button>
                    </Link>
                  ) : (
                    <button className="btn btn-block mt-4" disabled style={{ opacity: 0.5 }}>
                      HẾT HÀNG
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDevices