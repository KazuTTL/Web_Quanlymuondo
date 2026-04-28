import Device from '@/models/device'
import { logger } from '@/configs'

export default async function seed(session) {
    try {
    // Xóa dữ liệu thiết bị cũ
        await Device.deleteMany({}).session(session)

        // Dữ liệu mẫu
        const deviceData = [
            {
                name: 'Máy chiếu Sony VPL-DX102',
                description: 'Máy chiếu độ phân giải XGA (1024 x 768), độ sáng 2300 lumens',
                category: 'Thiết bị chiếu',
                location: 'Phòng A1.01',
                status: 'available',
                serialNumber: 'SNY2024001',
            },
            {
                name: 'Laptop Dell Latitude 5420',
                description: 'Intel Core i5, RAM 8GB, SSD 256GB',
                category: 'Máy tính',
                location: 'Phòng Lab 2',
                status: 'available',
                serialNumber: 'DELL2024001',
            },
            {
                name: 'Micro không dây Shure BLX24',
                description: 'Micro không dây có độ nhạy cao, phạm vi 100m',
                category: 'Thiết bị âm thanh',
                location: 'Phòng Hội thảo',
                status: 'available',
                serialNumber: 'SHR2024001',
            },
            {
                name: 'Camera Sony Alpha A6400',
                description: 'Máy ảnh Mirrorless với cảm biến APS-C 24.2MP',
                category: 'Thiết bị quay phim',
                location: 'Phòng Studio',
                status: 'available',
                serialNumber: 'SNY2024002',
            },
            {
                name: 'iPad Pro 12.9" 2022',
                description: 'Chip M2, RAM 8GB, 256GB Storage',
                category: 'Máy tính bảng',
                location: 'Phòng Lab 1',
                status: 'available',
                serialNumber: 'APL2024001',
            },
        ]

        // Thêm thiết bị mới
        await Device.insertMany(deviceData, { session })

        logger.info('Devices seeded successfully')
    } catch (error) {
        logger.error('Device seeding failed:', error)
        throw error
    }}
