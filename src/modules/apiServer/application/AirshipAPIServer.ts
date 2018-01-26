import {BaseRequestHandler} from "../domain/BaseRequestHandler";
import {RequestsProvider} from "../domain/RequestsProvider";
import BaseLogger from "../../logger/domain/BaseLogger";
import {ASRequest} from "../domain/entity/ASRequest";
import {ASResponse} from "../domain/entity/ASResponse";
import ErrorResponse from "../domain/entity/ASErrorResponse";
import {BaseStatisticsCounter} from "../../statistics/domain/BaseStatisticsCounter";

interface AirshipAPIServerConfig {
    requestsHandler: BaseRequestHandler,
    requestsProvider: RequestsProvider,
    statisticsCounter?: BaseStatisticsCounter,
    logger?: BaseLogger
}

/**
 * AirshipAPIServer is the main API server
 */
export default class AirshipAPIServer {
    constructor(
        private _config: AirshipAPIServerConfig
    ) {

    }

    private log(prefix: string, data?: any, depth?: boolean) {
        if (this._config.logger)
            this._config.logger.log(prefix, data, depth)
    }

    public async start() {
        this.log('Welcome to Airship API server')
        this._config.requestsProvider.getRequests((request, answerRequest) => {
            this.handleRequest(request, answerRequest)
        })
    }

    public async handleRequest(request: ASRequest, answerRequest: (response: ASResponse) => void) {
        this.log('Got request', request)

        if (this._config.statisticsCounter)
            this._config.statisticsCounter.countRequestHit()

        try {
            let response = await this._config.requestsHandler.handle(request)

            this.log('Got response for request', {
                request,
                response: response
            }, true)

            answerRequest(response)

            if (this._config.statisticsCounter)
                this._config.statisticsCounter.doneRequest()
        }
        catch (e) {
            console.log(e)

            if (e instanceof ErrorResponse) {
                answerRequest(e)
                return
            }

            answerRequest(
                new ErrorResponse(
                    e.message || 'Unknown error',
                    e.code || 0
                )
            )

            if (this._config.statisticsCounter)
                this._config.statisticsCounter.doneRequest()
        }
    }
}