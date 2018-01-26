import {format, inspect} from 'util'
import BaseLogger from '../domain/BaseLogger'

class ColorCodes {
    static RED = '\x1b[31m'
    static CYAN = '\x1b[36m'
    static YELLOW = '\x1b[33m'
    static RESET = '\x1b[0m'
}

export default class ConsoleLogger implements BaseLogger {
    public log(prefix: string, data?: any, recursiveDepth?: boolean) {
        this.prepareLog(ColorCodes.CYAN, 'log', prefix, data, recursiveDepth)
    }

    public warn(prefix: string, data?: any, recursiveDepth?: boolean) {
        this.prepareLog(ColorCodes.YELLOW, 'warn', prefix, data, recursiveDepth)
    }

    public error(prefix: string, data?: any, recursiveDepth?: boolean) {
        this.prepareLog(ColorCodes.RED, 'error', prefix, data, recursiveDepth)
    }

    private prepareLog(
        color: ColorCodes,
        tag: string,
        prefix: string,
        data?: any,
        recursiveDepth?: boolean
    ) {
        const time = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')

        if (data && recursiveDepth == true) {
            process.stdout.write(`${time} ${color}[${tag}]${ColorCodes.RESET} ${prefix} ${inspect(data || '', { depth: null })} \n`)

            return
        }

        process.stdout.write(`${time} ${color}[${tag}]${ColorCodes.RESET} ${prefix} ${format(data || '')} \n`)
    }
}