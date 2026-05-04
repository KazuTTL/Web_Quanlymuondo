import * as borrowRequestService from '../../services/borrow-request.service'
import * as emailService from '../../services/email.service'
import { db } from '../../../configs'

// Lấy tất cả yêu cầu mượn
export async function getAllBorrowRequests(req, res) {
    const borrowRequests = await borrowRequestService.getAllBorrowRequests(req.query)
    res.json({
        message: 'Lấy danh sách yêu cầu mượn thành công',
        data: borrowRequests
    })
}

// Lấy chi tiết yêu cầu mượn
export async function getBorrowRequestById(req, res) {
    const borrowRequest = await borrowRequestService.getBorrowRequestById(req.params.id)
    res.json({
        message: 'Lấy thông tin yêu cầu mượn thành công',
        data: borrowRequest
    })
}

// Duyệt yêu cầu mượn
export async function approveRequest(req, res) {
    try {
        const updatedRequest = await borrowRequestService.updateBorrowRequestStatus(
            null,
            req.params.id,
            'approved'
        )
        
        res.json({
            message: 'Duyệt yêu cầu mượn thành công',
            data: updatedRequest
        })
    } catch (error) {
        console.error('Error approving request:', error)
        res.status(500).json({
            message: error.message || 'Lỗi khi duyệt yêu cầu',
            error: error.message
        })
    }
}

// Từ chối yêu cầu mượn
export async function rejectRequest(req, res) {
    try {
        const { rejectReason } = req.body || {}
        const updatedRequest = await borrowRequestService.updateBorrowRequestStatus(
            null,
            req.params.id,
            'rejected',
            rejectReason
        )
        res.json({
            message: 'Từ chối yêu cầu mượn thành công',
            data: updatedRequest
        })
    } catch (error) {
        console.error('Error rejecting request:', error)
        res.status(500).json({
            message: error.message || 'Lỗi khi từ chối yêu cầu',
            error: error.message
        })
    }
}

// Xác nhận trả thiết bị
export async function returnDevice(req, res) {
    try {
        const result = await borrowRequestService.returnDevice(req.params.id)
        res.json({
            message: 'Đã xác nhận trả thiết bị thành công',
            data: result
        })
    } catch (error) {
        console.error('Error returning device:', error)
        res.status(500).json({
            message: error.message || 'Lỗi khi xác nhận trả thiết bị',
            error: error.message
        })
    }
}