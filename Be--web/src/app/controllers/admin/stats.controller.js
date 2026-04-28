import * as deviceStatsService from '@/app/services/device-stats.service'

// Lấy thống kê thiết bị mượn nhiều trong tháng
export async function getTopBorrowedDevices(req, res) {
    const limit = parseInt(req.query.limit) || 10
    const stats = await deviceStatsService.getTopBorrowedDevices(limit)
    res.json({
        message: 'Lấy thống kê thiết bị mượn nhiều thành công',
        data: stats
    })
}

// Lấy danh sách thiết bị quá hạn
export async function getOverdueDevices(req, res) {
    const overdueBorrows = await deviceStatsService.getOverdueBorrows()
    res.json({
        message: 'Lấy danh sách thiết bị quá hạn thành công',
        data: overdueBorrows
    })
}

// Lấy danh sách thiết bị sắp đến hạn
export async function getDueSoonDevices(req, res) {
    const daysThreshold = parseInt(req.query.days) || 3
    const dueSoonBorrows = await deviceStatsService.getDueSoonBorrows(daysThreshold)
    res.json({
        message: 'Lấy danh sách thiết bị sắp đến hạn thành công',
        data: dueSoonBorrows
    })
}
