import Joi from 'joi'
import { AsyncValidate } from '@/utils/classes'
import { Device } from '@/models'
import { isValidObjectId } from 'mongoose'

// Schema validation cho mượn thiết bị
export const borrowDevice = Joi.object({
    deviceId: Joi.string()
        .required()
        .custom((value, helpers) => {
            if (!isValidObjectId(value)) {
                return helpers.error('any.invalid')
            }
            return new AsyncValidate(value, async function() {
                const device = await Device.findOne({
                    _id: value,
                    status: 'available',
                    deleted: false
                })
                return device ? value : helpers.error('any.invalid')
            })
        })
        .label('ID thiết bị'),
    borrowDate: Joi.date()
        .min('now')
        .required()
        .label('Ngày mượn'),
    returnDate: Joi.date()
        .min(Joi.ref('borrowDate'))
        .required()
        .label('Ngày trả'),
    note: Joi.string()
        .trim()
        .max(200)
        .allow('')
        .default('')
        .label('Ghi chú')
})
