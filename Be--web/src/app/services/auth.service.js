import moment from 'moment'
import jwt from 'jsonwebtoken'
import { cache, LOGIN_EXPIRE_IN, TOKEN_TYPE, VALIDATE_EMAIL_REGEX , db } from '@/configs'
import { abort, generateToken } from '@/utils/helpers'
import bcrypt from 'bcrypt'

export const tokenBlocklist = cache.create('token-block-list')

const STATUS_ACCOUNT = {
    ACTIVE: 'ACTIVE',
    DE_ACTIVE: 'DE_ACTIVE',
}

// ✅ Đăng nhập ADMIN bằng email hoặc username
export async function checkValidLoginAdmin({ email, password }) {
    const query = `SELECT * FROM Users WHERE (Email = '${email}' OR Username = '${email}') AND IsDeleted = 0 AND RoleID = 1`
    const result = await db.query(query)
    const user = result.recordset[0]

    if (user) {
        const verified = bcrypt.compareSync(password, user.PasswordHash)
        if (verified) {
            if (user.TrangThai === STATUS_ACCOUNT.DE_ACTIVE) {
                abort(400, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản lý.')
            }
            user._id = user.UserID // Map cho frontend
            return user
        }
    }

    return false
}

export function authToken(admin) {
    const accessToken = generateToken({ adminId: admin._id || admin.UserID }, TOKEN_TYPE.ADMIN_AUTHORIZATION, LOGIN_EXPIRE_IN)
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: 'Bearer Token',
        user: {
            _id: admin.UserID,
            name: admin.HoTen,
            email: admin.Email,
            role: 'admin'
        }
    }
}

export async function profileAdmin(currentAdmin) {
    const id = currentAdmin._id || currentAdmin.UserID
    const result = await db.query(`SELECT UserID as _id, HoTen as name, Email as email, Phone as phone, Avatar as avatar, TrangThai as status FROM Users WHERE UserID = ${id}`)
    const acc = result.recordset[0]
    
    // Giả lập permissions để frontend không bị lỗi (vì đã bỏ bảng Permission)
    acc.permissions = ['super-admin']
    return acc
}

// ✅ Đăng nhập USER bằng email, số điện thoại hoặc username
export async function checkValidLoginUser({ username, password }) {
    const isEmail = VALIDATE_EMAIL_REGEX.test(username)
    const query = isEmail 
        ? `SELECT * FROM Users WHERE Email = '${username}' AND IsDeleted = 0 AND RoleID = 2`
        : `SELECT * FROM Users WHERE (Phone = '${username}' OR Username = '${username}') AND IsDeleted = 0 AND RoleID = 2`
        
    const result = await db.query(query)
    const user = result.recordset[0]

    if (user) {
        const verified = bcrypt.compareSync(password, user.PasswordHash)
        if (verified) {
            if (user.TrangThai === STATUS_ACCOUNT.DE_ACTIVE) {
                abort(400, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản lý.')
            }
            user._id = user.UserID // Map cho frontend
            return user
        }
    }

    return false
}

export function authTokenUser(user) {
    const accessToken = generateToken({ userId: user._id || user.UserID }, TOKEN_TYPE.USER_AUTHORIZATION, LOGIN_EXPIRE_IN)
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: 'Bearer Token',
        user: {
            _id: user.UserID,
            name: user.HoTen,
            email: user.Email,
            role: 'user'
        }
    }
}

export async function blockToken(token) {
    const decoded = jwt.decode(token)
    const expiresIn = decoded.exp
    const now = moment().unix()
    await tokenBlocklist.set(token, 1, expiresIn - now)
}

export async function registerUser(userData) {
    const isEmail = VALIDATE_EMAIL_REGEX.test(userData.username)
    let email = ''
    let phone = ''

    if (isEmail) {
        const checkResult = await db.query(`SELECT 1 FROM Users WHERE Email = '${userData.username}' AND IsDeleted = 0`)
        if (checkResult.recordset.length > 0) abort(400, 'Email đã được sử dụng.')
        email = userData.username
    } else {
        const checkResult = await db.query(`SELECT 1 FROM Users WHERE Phone = '${userData.username}' AND IsDeleted = 0`)
        if (checkResult.recordset.length > 0) abort(400, 'Số điện thoại đã được sử dụng.')
        phone = userData.username
    }

    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(userData.password, salt)
    const name = userData.name || userData.username

    const insertResult = await db.query(`
        INSERT INTO Users (HoTen, Username, Email, Phone, PasswordHash, RoleID, TrangThai)
        OUTPUT inserted.UserID as _id, inserted.*
        VALUES (N'${name}', '${userData.username}', '${email}', '${phone}', '${hash}', 2, 'ACTIVE')
    `)
    
    return insertResult.recordset[0]
}
