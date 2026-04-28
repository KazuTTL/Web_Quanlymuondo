import * as deviceService from '@/app/services/device.service'
import * as borrowRequestService from '@/app/services/borrow-request.service'
import { abort } from '@/utils/helpers'

export async function getAllDevices(req, res) {
    const devices = await deviceService.getAllDevices({ status: 'available' })
    res.status(200).json(devices)
}

export async function getTopDevices(req, res) {
    const devices = await deviceService.getTopDevices()
    res.status(200).json(devices)
}

export async function getDeviceById(req, res) {
    const device = await deviceService.getDeviceById(req.params.id)
    if (device.status !== 'available') {
        return abort(400, 'Thiết bị không khả dụng')
    }
    res.status(200).json(device)
}

// Đăng ký mượn thiết bị
export async function borrowDevice(req, res) {
    const { deviceId, borrowDate, returnDate } = req.body
    const device = await deviceService.getDeviceById(deviceId)
    
    if (!device || device.status !== 'available') {
        return abort(400, 'Thiết bị không khả dụng')
    }

    const borrowRequest = await borrowRequestService.createBorrowRequest({
        deviceId,
        userId: req.currentUser._id, 
        borrowDate,
        returnDate
    })

    res.status(201).jsonify({
        message: 'Đã gửi yêu cầu mượn thiết bị',
        request: borrowRequest
    })
}

// Lấy danh sách yêu cầu mượn của user hiện tại
export async function getMyBorrowRequests(req, res) {
    const requests = await borrowRequestService.getUserBorrowRequests(req.currentUser._id)
    res.jsonify(requests)
}