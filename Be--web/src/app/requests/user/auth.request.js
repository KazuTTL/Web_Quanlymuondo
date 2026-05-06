import Joi from 'joi'
import {VALIDATE_PHONE_REGEX, VALIDATE_EMAIL_REGEX} from '@/configs'

export const login = Joi.object({
    username: Joi.string().required().label('Tài khoản'),
    password: Joi.string().required().label('Mật khẩu'),
})

export const register = Joi.object({
    name: Joi.string().required().label('Họ tên'),
    username: Joi.string().required().label('Tài khoản'),
    password: Joi.string().min(6).required().label('Mật khẩu'),
    email: Joi.string().email().required().label('Email'),
    phone: Joi.string().allow('', null).label('Số điện thoại'),
    studentId: Joi.string().allow('', null).label('Mã sinh viên'),
    dob: Joi.date().allow('', null).label('Ngày sinh'),
    gender: Joi.string().valid('male', 'female', 'other', '').allow('', null).label('Giới tính'),
})

