import {BaseStatisticsCounter} from "../domain/BaseStatisticsCounter";
import BaseLogger from "../../logger/domain/BaseLogger";
import {memoryUsage} from 'process';

export default class LocalStatisticsCounter extends BaseStatisticsCounter {
    private _logger: BaseLogger

    private _hitsPerSecond: number

    private _hitsPerMinute: number

    private _concurrentRequests: number

    private _allRequests: number

    constructor(
        logger: BaseLogger,
        silently: boolean = false,
        logFrequency: number = 5000
    ) {
        super()

        this._logger = logger

        this._hitsPerSecond = 0
        this._hitsPerMinute = 0
        this._concurrentRequests = 0
        this._allRequests = 0

        this._logger.log('Local statistics started')

        setInterval(() => {
            if (!silently) {
                let memUsage = memoryUsage()

                this._logger.log(
                    'Local statistics:',
                    `\n   Hits per second: ${this._hitsPerSecond}\n` +
                    `   Hits per minute: ${this._hitsPerMinute}\n` +
                    `   All hits: ${this._allRequests}\n` +
                    `   Concurrent requests: ${this._concurrentRequests}\n` +
                    `   Total memory in RAM: ${this.toMegabytes(memUsage.rss)} mb\n` +
                    `   Native modules memory usage: ${this.toMegabytes((memUsage as any).external)} mb\n` +
                    `   V8 total heap: ${this.toMegabytes(memUsage.heapTotal)} mb\n` +
                    `   V8 used heap: ${this.toMegabytes(memUsage.heapUsed)} mb\n`
                )
            }

            this._hitsPerSecond = 0
        }, logFrequency)

        setInterval(() => {
            this._hitsPerMinute = 0
        }, 1000 * 60)
    }

    public countRequestHit(): void {
        this._hitsPerSecond++
        this._hitsPerMinute++
        this._concurrentRequests++
        this._allRequests++
    }

    public doneRequest(): void {
        this._concurrentRequests--
    }

    private toMegabytes(bytes: number): string {
        return (bytes / 1048576).toFixed(2)
    }
}