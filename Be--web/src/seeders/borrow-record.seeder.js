import BorrowRecord, { BORROW_RECORD_STATUS } from '@/models/borrow-record'
import BorrowRequest from '@/models/borrow-request'
import User from '@/models/user'
import Device from '@/models/device'
import { logger } from '@/configs'
import { addDays } from 'date-fns'

export default async function seed(session) {
    try {
        // Xóa dữ liệu cũ
        await BorrowRecord.deleteMany({}).session(session)

        // Lấy dữ liệu đã seed trước đó
        const users = await User.find().session(session)
        const devices = await Device.find().session(session)
        const requests = await BorrowRequest.find().session(session)

        if (!users.length || !devices.length || !requests.length) {
            throw new Error('Users, Devices, and BorrowRequests must be seeded first')
        }

        const now = new Date()

        // Dữ liệu mẫu
        const borrowRecords = [
            {
                borrowRequestId: requests[0]._id,
                userId: users[0]._id,
                deviceId: devices[0]._id,
                borrowDate: addDays(now, -3),
                returnDate: addDays(now, -1),
                actualReturnDate: addDays(now, -1),
                status: BORROW_RECORD_STATUS.RETURNED,
                note: 'Đã trả đúng hạn',
            },
            {
                borrowRequestId: requests[1]._id,
                userId: users[1]._id,
                deviceId: devices[1]._id,
                borrowDate: addDays(now, -1),
                returnDate: addDays(now, 1),
                status: BORROW_RECORD_STATUS.BORROWED,
                note: 'Đang sử dụng',
            },
        ]

        await BorrowRecord.insertMany(borrowRecords, { session })
        logger.info('Borrow records seeded successfully')
    } catch (error) {
        logger.error('Borrow record seeding failed:', error)
        throw error}}
