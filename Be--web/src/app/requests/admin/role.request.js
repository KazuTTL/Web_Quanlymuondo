// requests/admin/role.request.js
// Đã loại bỏ Mongoose. Validation đơn giản hóa vì Role không còn quản lý động
import Joi from 'joi'
import { tryValidateOrDefault } from '@/utils/helpers'

export const createItem = Joi.object({
    name: Joi.string().trim().max(50).required().label('Tên vai trò'),
    description: Joi.string().trim().max(100).empty(Joi.valid('', null)).default('').label('Mô tả'),
})

export const updateItem = Joi.object({
    name: Joi.string().trim().max(50).required().label('Tên vai trò'),
    description: Joi.string().trim().max(100).empty(Joi.valid('', null)).default('').label('Mô tả'),
})

export const addAccountsForRole = Joi.object({
    account_ids: Joi.array()
        .single()
        .items(Joi.string().trim().label('Người dùng'))
        .empty(Joi.valid('', null))
        .default([])
        .label('Người dùng'),
})

export const readAccounts = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), ''),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 50),
})
