import { useState, useEffect } from 'react'
import { getStatistics } from '../../services/api'
import { Package, Handshake, AlertTriangle, Wrench } from 'lucide-react'
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
    <div className="stat-kpi-card" style={{ borderLeftColor: color }}>
      <div className="stat-kpi-icon">{icon}</div>
      <div className="stat-kpi-info">
        <p className="stat-kpi-title">{title}</p>
        <p className="stat-kpi-value">{value}</p>
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

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        labels: {
          font: { family: "'Courier New', monospace", size: 11, weight: 'bold' }
        }
      }
    }
  }

  return (
    <div>
      <div className="container">
        <h1 className="stat-page-title">
          Hệ Thống Thống Kê & Báo Cáo
        </h1>

        {/* KPI CARDS */}
        <div className="stat-kpi-grid">
          <KPICard title="Tổng Thiết Bị" value={kpis?.totalDevices || 0} color="#3b82f6" icon={<Package size={24} />} />
          <KPICard title="Đang Cho Mượn" value={kpis?.borrowedDevices || 0} color="#f97316" icon={<Handshake size={24} />} />
          <KPICard title="Quá Hạn" value={kpis?.overdueDevices || 0} color="#ef4444" icon={<AlertTriangle size={24} />} />
          <KPICard title="Bảo Trì" value={kpis?.maintenanceDevices || 0} color="#94a3b8" icon={<Wrench size={24} />} />
        </div>

        <div className="stat-chart-grid-2">
          <div className="card">
            <h3 className="card-header">Tình Trạng Kho Vật Lý</h3>
            <div className="stat-chart-container">
              <Pie data={statusChartData} options={chartOptions} />
            </div>
          </div>
          <div className="card">
            <h3 className="card-header">Cơ Cấu Theo Danh Mục</h3>
            <div className="stat-chart-container">
              <Pie data={categoryChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="stat-chart-grid-2">
          <div className="card">
            <h3 className="card-header">Top Thiết Bị Mượn Nhiều Nhất</h3>
            <div className="stat-chart-container">
              <Bar data={topDevicesData} options={{ ...chartOptions, indexAxis: 'y' }} />
            </div>
          </div>
          <div className="card">
            <h3 className="card-header">Top Sinh Viên Mượn Nhiều Nhất</h3>
            <div className="stat-chart-container">
              <Bar data={topUsersData} options={{ ...chartOptions, indexAxis: 'y' }} />
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h3 className="card-header">Xu Hướng Mượn Thiết Bị Theo Tháng</h3>
          <div className="stat-chart-container">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminStatistics
