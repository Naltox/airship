import {BaseRequestHandler} from '../domain/BaseRequestHandler'
import {ASRequest} from '../domain/entity/ASRequest'
import {ASResponse} from '../domain/entity/ASResponse'

/**
 * RequestHandlersManager pretends BaseRequestHandler
 * and sends requests to handler that supports it
 */
export default class RequestHandlersManager extends BaseRequestHandler {
    constructor(
        private _handlers: BaseRequestHandler[]
    ) {
        super()
    }

    public supports(request: ASRequest): boolean {
        return true
    }

    public handle(request: ASRequest): Promise<ASResponse> {
        for (const handler of this._handlers) {
            if (handler.supports(request))
                return handler.handle(request)
        }

        throw new Error('Cant find handler for request')
    }
}