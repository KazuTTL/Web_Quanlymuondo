import Joi from 'joi'
import {VALIDATE_PHONE_REGEX} from '@/configs'

export const login = Joi.object({
    email: Joi.string().required().label('Tài khoản'),
    password: Joi.string().required().label('Mật khẩu'),
})
