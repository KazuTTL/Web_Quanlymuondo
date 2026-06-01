// requests/user/profile.request.js
// Đã loại bỏ Mongoose. Validation email/phone unique sẽ được kiểm tra trong service
import Joi from 'joi'
import { VALIDATE_PHONE_REGEX, VALIDATE_EMAIL_REGEX, VALIDATE_FULL_NAME_REGEX } from '@/configs'

export const updateProfile = Joi.object({
    name: Joi.string().pattern(VALIDATE_FULL_NAME_REGEX).max(50).label('Họ tên'),
    email: Joi.string().pattern(VALIDATE_EMAIL_REGEX).label('Email'),
    phone: Joi.string().pattern(VALIDATE_PHONE_REGEX).label('Số điện thoại'),
    gender: Joi.string().valid('male', 'female', 'other', '').label('Giới tính'),
    dob: Joi.date().allow(null, '').label('Ngày sinh'),
    address: Joi.string().max(200).allow('').label('Địa chỉ'),
    avatar: Joi.string().allow('').label('Ảnh đại diện'),
    studentId: Joi.string().allow('', null).label('Mã sinh viên'),
})