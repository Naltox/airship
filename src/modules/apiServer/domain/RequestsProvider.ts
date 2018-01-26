import {ASRequest} from './entity/ASRequest'
import {ASResponse} from './entity/ASResponse'

export abstract class RequestsProvider {
    public abstract getRequests(
        callback: (
            request: ASRequest,
            answerRequest: (response: ASResponse) => void
        ) => void
    ): void
}