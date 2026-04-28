import {abort, getToken, verifyToken} from '@/utils/helpers'
import _ from 'lodash'
import {tokenBlocklist} from '../../services/auth.service'
import {TOKEN_TYPE} from '@/configs'
import { db } from '@/configs'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'

export async function checkValidToken(req, res, next) {
    try {
        const token = getToken(req.headers)

        if (token) {
            const allowedToken = _.isUndefined(await tokenBlocklist.get(token))
            if (allowedToken) {
                const {adminId} = verifyToken(token, TOKEN_TYPE.ADMIN_AUTHORIZATION)
                
                // Get Admin from MSSQL
                const result = await db.query(`SELECT * FROM Users WHERE UserID = ${adminId} AND IsDeleted = 0 AND RoleID = 1`)
                const admin = result.recordset[0]
                
                if (admin) {
                    admin._id = admin.UserID
                    req.currentAdmin = admin
                    next()
                    return
                }
            }
        }
    } catch (error) {
        if (!(error instanceof JsonWebTokenError)) {
            throw error
        }
        if (error instanceof TokenExpiredError) {
            abort(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập để tiếp tục!')
        }
    }
    abort(401)
}
