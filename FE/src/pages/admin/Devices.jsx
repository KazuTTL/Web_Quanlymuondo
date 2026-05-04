import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllDevicesAdmin, createDevice, updateDevice, deleteDevice } from '../../services/api'

function AdminDevices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    category: '',
    quantity: 0,
    location: '',
    description: ''
  })

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      const res = await getAllDevicesAdmin()
      setDevices(res.data?.data || res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await updateDevice(editId, formData)
      } else {
        await createDevice(formData)
      }
      setShowForm(false)
      setEditId(null)
      setFormData({ name: '', serialNumber: '', category: '', quantity: 0, location: '', description: '' })
      loadDevices()
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi')
    }
  }

  const handleEdit = (device) => {
    setEditId(device.id || device.DeviceID)
    setFormData({
      name: device.name || device.TenThietBi,
      serialNumber: device.serialNumber || device.SerialNumber,
      category: device.category || device.DanhMuc,
      quantity: device.quantity || device.SoLuongTong,
      location: device.location || device.ViTri,
      description: device.description || device.MoTa
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Xóa thiết bị này?')) {
      try {
        await deleteDevice(id)
        loadDevices()
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi')
      }
    }
  }

  return (
    <div>
      <div className="navbar">
        <Link to="/admin" className="navbar-brand">LendHub ADMIN</Link>
        <div className="navbar-menu">
          <Link to="/admin" className="navbar-link">Dashboard</Link>
          <Link to="/admin/requests" className="navbar-link">Yêu Cầu</Link>
          <Link to="/admin/devices" className="navbar-link active">Thiết Bị</Link>
          <Link to="/admin/statistics" className="navbar-link">Thống Kê</Link>
        </div>
      </div>

      <div className="container">
        <div className="flex justify-between items-center mb-4">
          <h1 style={{ fontSize: '24px', textTransform: 'uppercase' }}>Quản Lý Thiết Bị</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'HỦY' : '+ THÊM THIẾT BỊ'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-4">
            <h3 className="card-header">{editId ? 'SỬA' : 'THÊM'} THIẾT BỊ</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Tên thiết bị *</label>
                  <input
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Serial Number *</label>
                  <input
                    className="input"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Danh mục *</label>
                  <input
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Số lượng *</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Vị trí *</label>
                  <input
                    className="input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Mô tả</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                {editId ? 'LƯU' : 'THÊM'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">ĐANG TẢI...</div>
        ) : devices.length === 0 ? (
          <div className="empty">Không có thiết bị nào</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Serial</th>
                <th>Danh Mục</th>
                <th>Tổng</th>
                <th>Khả Dụng</th>
                <th>Vị Trí</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id || device.DeviceID}>
                  <td>{device.name || device.TenThietBi}</td>
                  <td>{device.serialNumber || device.SerialNumber}</td>
                  <td>{device.category || device.DanhMuc}</td>
                  <td>{device.quantity || device.SoLuongTong}</td>
                  <td>{device.availableQuantity || device.SoLuongKhaDung}</td>
                  <td>{device.location || device.ViTri}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm" onClick={() => handleEdit(device)}>
                        SỬA
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(device.id || device.DeviceID)}>
                        XÓA
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminDevices