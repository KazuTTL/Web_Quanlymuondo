import mongoose from 'mongoose'
import {DATABASE_URI, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_AUTH_SOURCE} from './constants'

const mongoDb = {
    connect() {
        const options = {
            dbName: DB_NAME,
            autoCreate: true,
            autoIndex: true,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000,
        }
        if (DB_USERNAME) {
            options.user = DB_USERNAME
            options.pass = DB_PASSWORD
            options.authSource = DB_AUTH_SOURCE
        }
        return mongoose.connect(DATABASE_URI, options)
    },
    close(force) {
        return mongoose.connection.close(force)
    },
    transaction(...args) {
        return mongoose.connection.transaction(...args)
    },
    isDisconnected() {
        return mongoose.connection.readyState === 0
    },
}

export default mongoDb
