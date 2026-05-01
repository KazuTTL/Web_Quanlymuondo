// requests/user/device.request.js
// Đã loại bỏ Mongoose. deviceId là số nguyên (INT) theo SQL Server
import Joi from 'joi'

export const borrowDevice = Joi.object({
    deviceId: Joi.number().integer().required().label('ID thiết bị'),
    borrowDate: Joi.date().min('now').required().label('Ngày mượn'),
    returnDate: Joi.date().min(Joi.ref('borrowDate')).required().label('Ngày trả'),
    note: Joi.string().trim().max(200).allow('').default('').label('Ghi chú'),
})
