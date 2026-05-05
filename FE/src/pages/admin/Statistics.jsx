import { useState, useEffect } from 'react'
import { getStatistics } from '../../services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

function KPICard({ title, value, color, icon }) {
  return (
    <div className="card" style={{ borderLeft: `6px solid ${color}`, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ fontSize: '32px' }}>{icon}</div>
      <div>
        <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', margin: 0 }}>{title}</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{value}</p>
      </div>
    </div>
  )
}

function AdminStatistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await getStatistics()
      setStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">ĐANG TẢI THỐNG KÊ...</div>
  if (!stats) return <div className="empty">Không có dữ liệu thống kê</div>

  const { kpis = {}, statusDistribution = [], categoryDistribution = [], topDevices = [], topUsers = [], trend = [] } = stats || {}
  
  const statusChartData = {
    labels: (statusDistribution || []).map(d => d.label || 'N/A'),
    datasets: [{
      label: 'Số lượng',
      data: (statusDistribution || []).map(d => d.value || 0),
      backgroundColor: ['#22c55e', '#f97316', '#94a3b8', '#ef4444'],
    }]
  }
  
  const categoryChartData = {
    labels: (categoryDistribution || []).map(d => d.label || 'N/A'),
    datasets: [{
      label: 'Số lượng',
      data: (categoryDistribution || []).map(d => d.value || 0),
      backgroundColor: ['#3b82f6', '#a855f7', '#ec4899', '#eab308', '#14b8a6'],
    }]
  }
  
  const topDevicesData = {
    labels: (topDevices || []).map(d => d.label || 'N/A'),
    datasets: [{
      label: 'Số lần mượn',
      data: (topDevices || []).map(d => d.value || 0),
      backgroundColor: '#3b82f6',
    }]
  }
  
  const topUsersData = {
    labels: (topUsers || []).map(d => d.label || 'N/A'),
    datasets: [{
      label: 'Số lần mượn',
      data: (topUsers || []).map(d => d.value || 0),
      backgroundColor: '#a855f7',
    }]
  }
  
  const trendData = {
    labels: (trend || []).map(d => d.label || 'N/A'),
    datasets: [{
      label: 'Số yêu cầu mượn',
      data: (trend || []).map(d => d.value || 0),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }


  return (
    <div>
      <div className="container">
        <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '800', color: '#1e293b' }}>
          Hệ Thống Thống Kê & Báo Cáo
        </h1>

        {/* KPI CARDS */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <KPICard title="Tổng Thiết Bị" value={kpis?.totalDevices || 0} color="#3b82f6" icon="📦" />
          <KPICard title="Đang Cho Mượn" value={kpis?.borrowedDevices || 0} color="#f97316" icon="🤝" />
          <KPICard title="Quá Hạn" value={kpis?.overdueDevices || 0} color="#ef4444" icon="⚠️" />
          <KPICard title="Bảo Trì" value={kpis?.maintenanceDevices || 0} color="#94a3b8" icon="🛠️" />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="card-header">Tình Trạng Kho Vật Lý</h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="card">
            <h3 className="card-header">Cơ Cấu Theo Danh Mục</h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={categoryChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="card-header">Top Thiết Bị Mượn Nhiều Nhất</h3>
            <div style={{ height: '300px' }}>
              <Bar data={topDevicesData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="card">
            <h3 className="card-header">Top Sinh Viên Mượn Nhiều Nhất</h3>
            <div style={{ height: '300px' }}>
              <Bar data={topUsersData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <h3 className="card-header">Xu Hướng Mượn Thiết Bị Theo Tháng</h3>
          <div style={{ height: '300px' }}>
            <Line data={trendData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminStatistics
