import * as borrowRecordService from '@/app/services/borrow-record.service'

export async function getUserHistory(req, res) {
    const history = await borrowRecordService.getUserBorrowHistory(req.currentUser._id)
    res.json({
        message: 'Lấy lịch sử mượn trả thành công',
        data: history
    })
}
