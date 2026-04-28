import Joi from 'joi'
import { VALIDATE_PHONE_REGEX, VALIDATE_EMAIL_REGEX, VALIDATE_FULL_NAME_REGEX } from '@/configs'
import { User } from '@/models'
import { AsyncValidate } from '@/utils/classes'

export const updateProfile = Joi.object({
    name: Joi.string()
        .pattern(VALIDATE_FULL_NAME_REGEX)
        .max(50)
        .label('Họ tên'),
    
    email: Joi.string()
        .pattern(VALIDATE_EMAIL_REGEX)
        .label('Email')
        .custom((value, helpers) => 
            new AsyncValidate(value, async function(req) {
                if (!value) return value
                const existingUser = await User.findOne({ 
                    email: value, 
                    _id: { $ne: req.currentUser._id },
                    deleted: false 
                })
                return !existingUser ? value : helpers.error('any.exists')
            })
        ),
    
    phone: Joi.string()
        .pattern(VALIDATE_PHONE_REGEX)
        .label('Số điện thoại')
        .custom((value, helpers) => 
            new AsyncValidate(value, async function(req) {
                if (!value) return value
                const existingUser = await User.findOne({ 
                    phone: value, 
                    _id: { $ne: req.currentUser._id },
                    deleted: false 
                })
                return !existingUser ? value : helpers.error('any.exists')
            })
        ),
    
    gender: Joi.string()
        .valid('male', 'female', 'other', '')
        .label('Giới tính'),
    
    dob: Joi.date()
        .allow(null, '')
        .label('Ngày sinh'),
    
    address: Joi.string()
        .max(200)
        .allow('')
        .label('Địa chỉ'),
    
    avatar: Joi.string()
        .allow('')
        .label('Ảnh đại diện')
}) 