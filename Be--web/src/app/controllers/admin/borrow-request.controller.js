import * as borrowRequestService from '../../services/borrow-request.service'
import * as emailService from '../../services/email.service'
import { db } from '../../../configs'
import { BORROW_REQUEST_STATUS } from '../../../models/borrow-request'


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

// Cập nhật trạng thái yêu cầu mượn (APPROVED, REJECTED,...)
export async function updateBorrowRequestStatus(req, res) {
    await db.transaction(async (session) => {
        const updatedRequest = await borrowRequestService.updateBorrowRequestStatus(
            session,
            req.params.id,
            req.body.status
        )
        res.status(200).json({
            message: 'Cập nhật trạng thái yêu cầu mượn thành công',
            data: updatedRequest
        })
    })
}

// Duyệt yêu cầu mượn
export async function approveRequest(req, res) {
    await db.transaction(async (session) => {
        const updatedRequest = await borrowRequestService.updateBorrowRequestStatus(
            session,
            req.params.id,
            BORROW_REQUEST_STATUS.APPROVED
        )

        res.json({
            message: 'Đã duyệt yêu cầu mượn thành công',
            data: updatedRequest
        })
    })
}

// Từ chối yêu cầu mượn
export async function rejectRequest(req, res) {
    await db.transaction(async (session) => {
        const updatedRequest = await borrowRequestService.updateBorrowRequestStatus(
            session,
            req.params.id,
            BORROW_REQUEST_STATUS.REJECTED
        )
        res.json({
            message: 'Đã từ chối yêu cầu mượn thành công',
            data: updatedRequest
        })
    })
}

export async function returnDevice(req, res) {
    const borrowRequest = await borrowRequestService.returnDevice(req.params.id)
    res.status(200).json({
        message: 'Đã xác nhận trả thiết bị thành công',
        data: borrowRequest
    })
}
