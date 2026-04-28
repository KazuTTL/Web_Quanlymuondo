import Joi from 'joi'
import {VALIDATE_PHONE_REGEX, VALIDATE_EMAIL_REGEX} from '@/configs'

export const login = Joi.object({
    username: Joi.alternatives()
        .try(
            Joi.string().pattern(VALIDATE_PHONE_REGEX).label('Số điện thoại'),
            Joi.string().pattern(VALIDATE_EMAIL_REGEX).label('Email')
        )
        .required()
        .label('Tài khoản'),
    password: Joi.string().required().label('Mật khẩu'),
})

export const register = Joi.object({
    name: Joi.string().required().label('Họ tên'),
    username: Joi.alternatives()
        .try(
            Joi.string().pattern(VALIDATE_PHONE_REGEX).label('Số điện thoại'),
            Joi.string().pattern(VALIDATE_EMAIL_REGEX).label('Email')
        )
        .required()
        .label('Tài khoản'),
    password: Joi.string().required().label('Mật khẩu')
}) 

