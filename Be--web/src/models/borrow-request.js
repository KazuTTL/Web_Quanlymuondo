// models/borrow-request.js
// Mongoose đã được loại bỏ. Chỉ giữ lại hằng số BORROW_REQUEST_STATUS
// dùng chung cho validation và business logic

export const BORROW_REQUEST_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
}

export default null
