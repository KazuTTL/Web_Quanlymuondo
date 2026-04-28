import sql from 'mssql'
import { DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT } from './constants'
import logger from './logger'

const sqlConfig = {
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    server: DB_SERVER,
    port: DB_PORT,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}

let poolPromise = null

const db = {
    connect: async () => {
        if (poolPromise) return poolPromise
        try {
            poolPromise = await sql.connect(sqlConfig)
            logger.info('Connected to SQL Server successfully')
            return poolPromise
        } catch (err) {
            logger.error('Database Connection Failed! Bad Config: ', err)
            poolPromise = null
            throw err
        }
    },
    close: async () => {
        if (poolPromise) {
            await poolPromise.close()
            poolPromise = null
        }
    },
    query: async (queryString) => {
        const pool = await db.connect()
        return pool.request().query(queryString)
    },
    execute: async (spName, params = {}) => {
        const pool = await db.connect()
        const request = pool.request()
        
        for (const [key, value] of Object.entries(params)) {
            request.input(key, value)
        }
        
        return request.execute(spName)
    },
    request: async () => {
        const pool = await db.connect()
        return pool.request()
    }
}

export default db
