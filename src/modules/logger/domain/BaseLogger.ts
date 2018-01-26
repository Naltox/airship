export default interface BaseLogger {
    log(prefix: string, data?: any, recursiveDepth?: boolean): void

    warn(prefix: string, data?: any, recursiveDepth?: boolean): void

    error(prefix: string, data?: any, recursiveDepth?: boolean): void
}