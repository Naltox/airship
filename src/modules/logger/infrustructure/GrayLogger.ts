import ConsoleLogger from './ConsoleLogger'
import {format} from 'util'
const graylog2 = require('graylog2')

export default class GrayLogger extends ConsoleLogger {
    private _logger: any

    constructor(config: any) {
        super()

        this._logger = new graylog2.graylog(config)

        this._logger.on('error', (error: any) => {
            super.error('Error while trying to write to graylog2:', error)
        })
    }

    public log(prefix: string, data?: any) {
        super.log(prefix, data)
        this._logger.info(this.formatLog(prefix, data))
    }

    public warn(prefix: string, data?: any) {
        super.warn(prefix, data)
        this._logger.warning(this.formatLog(prefix, data))
    }

    public error(prefix: string, data?: any) {
        super.error(prefix, data)
        this._logger.error(this.formatLog(prefix, data))
    }

    private formatLog(prefix: string, data?: any) {
        return `${prefix} ${format(data || '')}`
    }
}