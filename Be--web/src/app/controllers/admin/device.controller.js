import * as deviceService from '@/app/services/device.service'
import { db } from '@/configs'

// Lấy danh sách thiết bị
export async function readAllDevices(req, res) {
    const devices = await deviceService.getAllDevices(req.query)
    res.json({
        message: 'Lấy danh sách thiết bị thành công',
        data: devices
    })
}

// Lấy thống kê thiết bị
export async function getDeviceStatistics(req, res) {
    const stats = await deviceService.getDeviceStatistics()
    res.json({
        message: 'Lấy thống kê thiết bị thành công',
        data: stats
    })
}

// Lấy chi tiết thiết bị theo ID
export async function readDeviceById(req, res) {
    const device = await deviceService.getDeviceById(req.params.id)
    res.json({
        message: 'Lấy thông tin thiết bị thành công',
        data: device
    })
}

// Tạo thiết bị mới
export async function createDevice(req, res) {
    const newDevice = await deviceService.createDevice(null, req.body)
    res.status(201).json({
        message: 'Tạo thiết bị thành công',
        data: newDevice
    })
}

// Cập nhật thiết bị
export async function updateDevice(req, res) {
    const updatedDevice = await deviceService.updateDevice(null, req.params.id, req.body)
    res.json({
        message: 'Cập nhật thiết bị thành công',
        data: updatedDevice
    })
}

// Xoá thiết bị
export async function deleteDevice(req, res) {
    await deviceService.deleteDevice(null, req.params.id)
    res.status(204).send()
}
