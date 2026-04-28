import moment from 'moment'
import yaml from 'yaml'
import winston from 'winston'
import assert from 'assert'
import chalk from 'chalk'
import _ from 'lodash'
import {APP_DEBUG, LOG_DIR} from './constants'

const now = () => moment().format('\\[YYYY-MM-DD HH:mm:ss\\]')

const wLogger = winston.createLogger({
    format: winston.format.printf(function (info) {
        const {level, message, ...data} = info
        let msg = `${now()} ${_.upperCase(level)}: ${message}`
        if (!_.isEmpty(data)) {
            msg += '\n' + yaml.stringify(data)
        }
        return msg
    }),
})

const logger = {
    error(arg) {
        let message = ''
        let name = ''
        let stack = ''

        if (typeof arg === 'string') {
            message = arg
        } else if (arg instanceof Error) {
            message = arg.message
            name = arg.name
            stack = arg.stack
        } else if (arg && typeof arg === 'object') {
            message = arg.message || ''
            name = arg.name || ''
            stack = arg.stack || ''
        } else {
            message = String(arg)
        }

        assert(_.isString(message), new TypeError('"message" must be a string.'))

        console.error(chalk.redBright(now(), name ? `${name}:` : 'ERROR:', message))

        if (_.isArray(stack) && !_.isEmpty(stack)) {
            const stackStr = stack.map((s) => '- ' + s).join('\n')
            console.error(chalk.redBright(stackStr))
        } else if (_.isString(stack)) {
            console.error(chalk.redBright(stack))
        }

        if (!APP_DEBUG) {
            const fileLog = `node-${moment().format('YYYY-MM-DD')}.log`
            const [transport] = wLogger.transports
            if (transport?.filename !== fileLog) {
                wLogger.configure({
                    transports: new winston.transports.File({
                        filename: fileLog,
                        dirname: LOG_DIR,
                    }),
                })
            }
            return wLogger.error({message, name, stack})
        }

        console.error(chalk.redBright('Logging to file is disabled in debug mode.'))
    },

    info(message) {
        console.log(chalk.blueBright(now(), 'INFO:', message))
        if (!APP_DEBUG) {
            const fileLog = `node-${moment().format('YYYY-MM-DD')}.log`
            const [transport] = wLogger.transports
            if (transport?.filename !== fileLog) {
                wLogger.configure({
                    transports: new winston.transports.File({
                        filename: fileLog,
                        dirname: LOG_DIR,
                    }),
                })
            }
            wLogger.info(message)
        }
    },
}

export default logger
