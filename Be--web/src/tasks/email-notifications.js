import schedule from 'node-schedule'
import * as deviceStatsService from '@/app/services/device-stats.service'
import * as emailService from '@/app/services/email.service'
import { logger } from '@/configs'

// Chạy vào 9h sáng mỗi ngày
schedule.scheduleJob('0 9 * * *', async () => {
    try {
        // Kiểm tra và gửi email cho các thiết bị sắp đến hạn trả
        const dueSoonBorrows = await deviceStatsService.getDueSoonBorrows()
        for (const borrow of dueSoonBorrows) {
            await emailService.sendBorrowDueReminderEmail(borrow.user, borrow)
        }

        // Kiểm tra và gửi email cho các thiết bị quá hạn
        const overdueBorrows = await deviceStatsService.getOverdueBorrows()
        for (const borrow of overdueBorrows) {
            await emailService.sendBorrowOverdueAlert(borrow.user, borrow)
        }
    } catch (error) {
        logger.error('Error in email notification task', error)
    }
})
