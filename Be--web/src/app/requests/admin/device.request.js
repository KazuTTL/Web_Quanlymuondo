// requests/admin/device.request.js
// Đã loại bỏ Mongoose. Validation đơn giản hóa, kiểm tra unique thực hiện trong service
import Joi from 'joi'
import { BORROW_REQUEST_STATUS } from '@/models/borrow-request'

export const createDevice = Joi.object({
    name: Joi.string().trim().max(100).required().label('Tên thiết bị'),
    serialNumber: Joi.string().trim().required().label('Số serial'),
    description: Joi.string().trim().max(500).allow('').default('').label('Mô tả'),
    quantity: Joi.number().integer().min(1).required().label('Số lượng'),
    status: Joi.string().valid('available', 'unavailable', 'maintenance').default('available').label('Trạng thái'),
    category: Joi.string().trim().max(50).required().label('Danh mục'),
    location: Joi.string().trim().max(100).required().label('Vị trí'),
    imageUrl: Joi.string().trim().allow('').default('').label('Hình ảnh'),
}).unknown(true)

export const updateDevice = Joi.object({
    name: Joi.string().trim().max(100).label('Tên thiết bị'),
    description: Joi.string().trim().max(500).allow('').label('Mô tả'),
    quantity: Joi.number().integer().min(1).label('Số lượng'),
    status: Joi.string().valid('available', 'unavailable', 'maintenance').label('Trạng thái'),
    category: Joi.string().trim().max(50).label('Danh mục'),
    location: Joi.string().trim().max(100).label('Vị trí'),
    imageUrl: Joi.string().trim().allow('').label('Hình ảnh'),
}).unknown(true)

export const borrowDevice = Joi.object({
    deviceId: Joi.number().integer().required().label('ID thiết bị'),
    borrowDate: Joi.date().min('now').required().label('Ngày mượn'),
    returnDate: Joi.date().min(Joi.ref('borrowDate')).required().label('Ngày trả'),
    note: Joi.string().trim().max(200).allow('').default('').label('Ghi chú'),
})

export const updateStatus = Joi.object({
    status: Joi.string()
        .valid(...Object.values(BORROW_REQUEST_STATUS))
        .required()
        .messages({
            'string.base': 'Trạng thái không hợp lệ',
            'any.required': 'Trạng thái là bắt buộc',
            'any.only': 'Trạng thái không hợp lệ',
        }),
    reason: Joi.when('status', {
        is: BORROW_REQUEST_STATUS.REJECTED,
        then: Joi.string().required().messages({
            'string.empty': 'Lý do từ chối là bắt buộc',
            'any.required': 'Lý do từ chối là bắt buộc',
        }),
        otherwise: Joi.string().allow('').optional(),
    }),
})
