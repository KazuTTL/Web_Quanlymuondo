import Joi from 'joi'
import { isValidObjectId } from 'mongoose'

export const createAchievementSchema = Joi.object({
    name_event: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(100)
        .label('Tên sự kiện'),
    
    finish_time: Joi.date()
        .required()
        .label('Thời gian hoàn thành'),
    
    pace: Joi.string()
        .required()
        .trim()
        .pattern(/^(\d{1,2}):(\d{2})\s+min\/km$/)
        .message('Nhịp độ phải có định dạng "X:XX min/km"')
        .label('Nhịp độ trung bình'),
    
    distance: Joi.string()
        .required()
        .trim()
        .pattern(/^\d+(\.\d+)?\s*(km|m)$/)
        .message('Quãng đường phải có định dạng "X km" hoặc "X m"')
        .label('Quãng đường chạy'),
    
    best_achievement: Joi.boolean()
        .default(false)
        .label('Thành tích nổi bật'),
    
    event_id: Joi.string()
        .allow(null, '')
        .custom((value, helpers) => {
            if (value && !isValidObjectId(value)) {
                return helpers.error('any.invalid')
            }
            return value
        })
        .label('ID sự kiện')
})

export const updateAchievementSchema = Joi.object({
    name_event: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .label('Tên sự kiện'),
    
    finish_time: Joi.date()
        .label('Thời gian hoàn thành'),
    
    pace: Joi.string()
        .trim()
        .pattern(/^(\d{1,2}):(\d{2})\s+min\/km$/)
        .message('Nhịp độ phải có định dạng "X:XX min/km"')
        .label('Nhịp độ trung bình'),
    
    distance: Joi.string()
        .trim()
        .pattern(/^\d+(\.\d+)?\s*(km|m)$/)
        .message('Quãng đường phải có định dạng "X km" hoặc "X m"')
        .label('Quãng đường chạy'),
    
    best_achievement: Joi.boolean()
        .label('Thành tích nổi bật')
}) 