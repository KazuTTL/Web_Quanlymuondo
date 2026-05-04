import * as deviceStatsService from '@/app/services/device-stats.service'
 
export async function getDashboardStats(req, res) {
    try {
        const [
            kpis,
            statusDist,
            catDist,
            topDevices,
            topUsers,
            trend
        ] = await Promise.all([
            deviceStatsService.getDashboardStats(),
            deviceStatsService.getDeviceStatusDistribution(),
            deviceStatsService.getCategoryDistribution(),
            deviceStatsService.getTopDevicesMonthly(),
            deviceStatsService.getTopUsersMonthly(),
            deviceStatsService.getBorrowingTrend()
        ])

        res.json({
            message: 'Lấy thống kê dashboard chi tiết thành công',
            data: {
                kpis,
                statusDistribution: statusDist,
                categoryDistribution: catDist,
                topDevices,
                topUsers,
                trend
            }
        })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thống kê', error: error.message })
    }
}
 
export async function getTopBorrowedDevices(req, res) {
    const limit = parseInt(req.query.limit) || 10
    const stats = await deviceStatsService.getTopBorrowedDevices(limit)
    res.json({
        message: 'Lấy thống kê thiết bị mượn nhiều thành công',
        data: stats
    })
}
 
export async function getOverdueDevices(req, res) {
    const overdueBorrows = await deviceStatsService.getOverdueBorrows()
    res.json({
        message: 'Lấy danh sách thiết bị quá hạn thành công',
        data: overdueBorrows
    })
}
 
export async function getDueSoonDevices(req, res) {
    const daysThreshold = parseInt(req.query.days) || 3
    const dueSoonBorrows = await deviceStatsService.getDueSoonBorrows(daysThreshold)
    res.json({
        message: 'Lấy danh sách thiết bị sắp đến hạn thành công',
        data: dueSoonBorrows
    })
}
