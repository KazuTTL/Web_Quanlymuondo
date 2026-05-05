import { db } from '@/configs'
import { abort } from '@/utils/helpers'
import * as deviceStatsService from '@/app/services/device-stats.service'
import * as emailService from '@/app/services/email.service'
import * as notificationService from '@/app/services/notification.service'

export async function sendOverdueReminders(req, res) {
    try {
        const overdueList = await deviceStatsService.getOverdueBorrows()
        
        const results = await Promise.all(overdueList.map(async (item) => {
            const user = item.borrowRequestId.user
            const device = item.borrowRequestId.device
            
            // 1. Send Email
            await emailService.sendBorrowOverdueAlert(user, {
                user,
                device: device,
                overdueDays: item.overdueDays
            })
            
            // 2. Create In-app Notification
            await notificationService.createNotification(
                item.borrowRequestId.userId || 0, // Need to ensure userId is available
                'Cảnh báo quá hạn',
                `Thiết bị ${device.name} đã quá hạn trả ${item.overdueDays} ngày. Vui lòng trả sớm!`
            )
            
            return { user: user.name, status: 'sent' }
        }))
        
        res.json({
            message: `Đã gửi nhắc nhở cho ${results.length} sinh viên`,
            details: results
        })
    } catch (error) {
        console.error(error)
        abort(500, 'Lỗi khi gửi nhắc nhở quá hạn')
    }
}

export async function getUserNotifications(req, res) {
    const userId = req.currentUser._id
    const notifications = await notificationService.getUserNotifications(userId)
    res.json({
        message: 'Lấy thông báo thành công',
        data: notifications
    })
}

export async function markNotificationRead(req, res) {
    const { id } = req.params
    await notificationService.markNotificationAsRead(id)
    res.json({ message: 'Đã đánh dấu là đã đọc' })
}
