import sql from 'mssql'
import { DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT } from './constants'
import logger from './logger'

let server = DB_SERVER
let instanceName

if (DB_SERVER && DB_SERVER.includes('\\')) {
    const parts = DB_SERVER.split('\\')
    server = parts[0] === '.' ? 'localhost' : parts[0]
    instanceName = parts[1]
}

const sqlConfig = {
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    server: server,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

if (instanceName) {
    sqlConfig.options.instanceName = instanceName
} else if (DB_PORT) {
    sqlConfig.port = DB_PORT
}

let poolInstance = null
let connectingPromise = null

const db = {
    connect: () => {
        if (poolInstance) return Promise.resolve(poolInstance)
        if (connectingPromise) return connectingPromise

        connectingPromise = sql.connect(sqlConfig)
            .then((pool) => {
                poolInstance = pool
                connectingPromise = null
                logger.info('Connected to SQL Server successfully')
                return pool
            })
            .catch((err) => {
                connectingPromise = null
                logger.error('Database Connection Failed! Bad Config: ', err)
                throw err
            })

        return connectingPromise
    },
    close: async () => {
        if (poolInstance) {
            await poolInstance.close()
            poolInstance = null
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
