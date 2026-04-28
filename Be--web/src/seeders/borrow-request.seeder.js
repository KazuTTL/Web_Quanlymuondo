import BorrowRequest from '@/models/borrow-request'
import User from '@/models/user'
import Device from '@/models/device'
import { logger } from '@/configs'
// import { addDays } from 'date-fns'
const addDays = (date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

export default async function seed(session) {
    try {
        // Xóa dữ liệu cũ
        await BorrowRequest.deleteMany({}).session(session)

        // Lấy users và devices đã tạo
        const user= await User.find().session(session)
        const devices = await Device.find().session(session)

        if (!user.length || !devices.length) {
            throw new Error('Users and Devices must be seeded first')
        }

        const now = new Date()

        // Tạo dữ liệu mẫu
        const borrowRequests = [
            {
                userId: user[0]._id,
                deviceId: devices[0]._id,
                purpose: 'Sử dụng cho bài thuyết trình môn CNPM',
                borrowDate: now,
                returnDate: addDays(now, 2),
                status: 'approved',
                note: 'Đã nhận thiết bị'
            },
            {
                userId: user[1]._id,
                deviceId: devices[1]._id,
                purpose: 'Làm đồ án môn học',
                borrowDate: addDays(now, 1),
                returnDate: addDays(now, 3),
                status: 'pending',
                note: 'Đang chờ duyệt'
            },
        ]

        await BorrowRequest.insertMany(borrowRequests)
        logger.info('Borrow requests seeded successfully')
    } catch (error) {
        logger.error(error)
        throw error
    }
}
