import {ASResponse} from './entity/ASResponse'
import {ASRequest} from './entity/ASRequest'

export abstract class BaseRequestHandler {
    public abstract async handle(request: ASRequest): Promise<ASResponse>

    public abstract supports(request: ASRequest): boolean
}