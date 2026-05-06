import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDevices } from '../../services/api'
import StudentNavbar from '../../components/StudentNavbar'

function StudentDevices() {
  const [devices, setDevices] = useState([])
  const [allDevices, setAllDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadDevices()
  }, [])

  // Debounce search - lọc ngay khi nhập, không cần Enter
  useEffect(() => {
    if (!search.trim()) {
      setDevices(allDevices)
      return
    }
    const keyword = search.toLowerCase()
    const filtered = allDevices.filter(d =>
      (d.name || '').toLowerCase().includes(keyword) ||
      (d.category || '').toLowerCase().includes(keyword) ||
      (d.serialNumber || '').toLowerCase().includes(keyword)
    )
    setDevices(filtered)
  }, [search, allDevices])

  const loadDevices = async () => {
    try {
      const res = await getDevices()
      const data = res.data?.data || res.data || []
      const list = Array.isArray(data) ? data : []
      setAllDevices(list)
      setDevices(list)
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
      <StudentNavbar />


      <div className="container">
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '24px' }}>
          Danh Sách Thiết Bị
        </h1>

        {/* Thanh tìm kiếm - chỉ hiện khi có dữ liệu */}
        {allDevices.length > 0 && (
          <div className="input-group" style={{ maxWidth: '400px', marginBottom: '16px' }}>
            <input
              type="text"
              className="input"
              placeholder="🔍 Tìm kiếm theo tên, danh mục, serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : allDevices.length === 0 ? (
          <div className="empty">Không có thiết bị nào trong kho</div>
        ) : devices.length === 0 ? (
          <div className="empty">Không tìm thấy thiết bị phù hợp với "{search}"</div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {devices.map((device) => {
              const status = getStatusTag(device.status)
              return (
                <div key={device.id || device._id} className="card">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`tag ${status.class}`}>{status.text}</span>
                    <span style={{ fontWeight: 'bold' }}>SL: {device.availableQuantity}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{device.name}</h3>
                  <p style={{ color: 'var(--gray)', fontSize: '12px' }}>{device.serialNumber}</p>
                  <p style={{ marginTop: '8px', fontSize: '12px' }}>{device.category}</p>
                  
                  {device.availableQuantity > 0 ? (
                    <Link to={`/borrow/${device.id || device._id}`}>
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