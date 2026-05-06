import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllDevicesAdmin, createDevice, updateDevice, deleteDevice } from '../../services/api'

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', border: '3px solid #0a0a0a', boxShadow: '6px 6px 0 #0a0a0a',
        padding: '24px', minWidth: '360px', maxWidth: '480px', width: '90%'
      }}>
        <div style={{
          fontWeight: 'bold', fontSize: '18px', textTransform: 'uppercase',
          borderBottom: '2px solid #0a0a0a', paddingBottom: '12px', marginBottom: '16px'
        }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

const EMPTY_FORM = { name: '', serialNumber: '', category: '', quantity: 1, maintenanceCount: 0, borrowedCount: 0, location: '', description: '' }

function AdminDevices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete modal
  const [deleteModal, setDeleteModal] = useState(null) // { id, name }
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    setLoading(true)
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
    setFormError('')

    // Tính số lượng khả dụng tự động
    const availableQuantity = (formData.quantity || 0) - (formData.maintenanceCount || 0) - (formData.borrowedCount || 0)
    if (availableQuantity < 0) {
      setFormError(`Tổng số lượng (${formData.quantity}) không đủ để trừ cho bảo hành (${formData.maintenanceCount}) và đang mượn (${formData.borrowedCount}).`)
      return
    }

    setSubmitLoading(true)
    try {
      const submitData = { ...formData, availableQuantity }
      if (editId) {
        await updateDevice(editId, submitData)
      } else {
        await createDevice(submitData)
      }
      setShowForm(false)
      setEditId(null)
      setFormData(EMPTY_FORM)
      loadDevices()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = (device) => {
    setEditId(device._id || device.DeviceID)
    setFormData({
      name: device.name || device.TenThietBi || '',
      serialNumber: device.serialNumber || device.SerialNumber || '',
      category: device.category || device.DanhMuc || '',
      quantity: device.quantity || device.SoLuongTong || 1,
      maintenanceCount: device.maintenanceCount || device.SoLuongBaoTri || 0,
      borrowedCount: device.borrowedCount || device.SoLuongDangMuon || 0,
      location: device.location || device.ViTri || '',
      description: device.description || device.MoTa || ''
    })
    setFormError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditId(null)
    setFormData(EMPTY_FORM)
    setFormError('')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await deleteDevice(deleteModal.id)
      setDeleteModal(null)
      loadDevices()
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Có lỗi khi xóa thiết bị')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <div className="container">
        <div className="flex justify-between items-center mb-4">
          <h1 style={{ fontSize: '24px', textTransform: 'uppercase' }}>Quản Lý Thiết Bị</h1>

          <button
            className={`btn ${showForm ? '' : 'btn-primary'}`}
            onClick={showForm ? handleCancelForm : () => { setEditId(null); setFormData(EMPTY_FORM); setFormError(''); setShowForm(true) }}
          >
            {showForm ? 'HỦY' : '+ THÊM THIẾT BỊ'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-4">
            <div className="card-header">{editId ? 'SỬA' : 'THÊM'} THIẾT BỊ</div>
            {formError && <div className="alert alert-error mb-4">{formError}</div>}
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
                    required={!editId}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Danh mục *</label>
                  <input
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="VD: Máy tính xách tay"
                    required
                  />
                </div>
                 <div className="input-group">
                   <label className="input-label">Tổng số lượng *</label>
                   <input
                     type="number" min="1"
                     className="input"
                     value={formData.quantity}
                     onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                     required
                   />
                 </div>
                 <div className="input-group">
                   <label className="input-label">Đang bảo hành</label>
                   <input
                     type="number" min="0"
                     className="input"
                     value={formData.maintenanceCount}
                     onChange={(e) => setFormData({ ...formData, maintenanceCount: parseInt(e.target.value) || 0 })}
                   />
                 </div>
                 <div className="input-group">
                   <label className="input-label">Đang cho mượn</label>
                   <input
                     type="number" min="0"
                     className="input"
                     value={formData.borrowedCount}
                     onChange={(e) => setFormData({ ...formData, borrowedCount: parseInt(e.target.value) || 0 })}
                   />
                 </div>
                 <div className="input-group">
                   <label className="input-label">Khả dụng (tự tính)</label>
                   <input
                     type="number"
                     className="input"
                     value={Math.max(0, (formData.quantity || 0) - (formData.maintenanceCount || 0) - (formData.borrowedCount || 0))}
                     disabled
                     style={{ opacity: 0.7, background: '#f5f5f5', cursor: 'not-allowed' }}
                   />
                   <small style={{ color: '#6b7280', fontSize: '11px' }}>= Tổng - Bảo hành - Đang mượn</small>
                 </div>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Vị trí *</label>
                  <input
                    className="input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="VD: Phòng IT - Tầng 2"
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
              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? 'ĐANG LƯU...' : (editId ? 'LƯU THAY ĐỔI' : 'THÊM THIẾT BỊ')}
                </button>
                <button type="button" className="btn" onClick={handleCancelForm}>HỦY</button>
              </div>
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
                <tr key={device._id || device.DeviceID}>
                  <td>{device.name || device.TenThietBi}</td>
                  <td>{device.serialNumber || device.SerialNumber}</td>
                  <td>{device.category || device.DanhMuc}</td>
                  <td>{device.quantity || device.SoLuongTong}</td>
                  <td>{device.availableQuantity || device.SoLuongKhaDung}</td>
                  <td>{device.location || device.ViTri}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-sm" onClick={() => handleEdit(device)}>SỬA</button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => { setDeleteError(''); setDeleteModal({ id: device._id || device.DeviceID, name: device.name || device.TenThietBi }) }}
                      >XÓA</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deleteModal && (
        <Modal title="Xác Nhận Xóa" onClose={() => setDeleteModal(null)}>
          <p style={{ marginBottom: '16px' }}>
            Bạn có chắc muốn <strong style={{ color: '#ef4444' }}>xóa</strong> thiết bị:
            <br /><strong>"{deleteModal.name}"</strong>?
            <br /><span style={{ fontSize: '12px', color: '#6b7280' }}>Hành động này không thể hoàn tác.</span>
          </p>
          {deleteError && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{deleteError}</div>}
          <div className="flex gap-2 justify-center">
            <button className="btn btn-danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? 'ĐANG XÓA...' : '🗑 XÓA'}
            </button>
            <button className="btn" onClick={() => setDeleteModal(null)} disabled={deleteLoading}>HỦY</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminDevices