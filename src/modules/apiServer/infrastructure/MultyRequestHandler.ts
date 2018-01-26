import {BaseRequestHandler} from "../domain/BaseRequestHandler";
import {ASResponse} from "../domain/entity/ASResponse";
import {ASRequest} from "../domain/entity/ASRequest";

type HandlerFunction = (request: ASRequest) => ASResponse

type Wrapper<T> = { [P in keyof T]: T[P] }

type RequestType = Wrapper<typeof ASRequest>

type MultiRequestHandlerType = Wrapper<typeof MultiRequestHandler>

export abstract class MultiRequestHandler extends BaseRequestHandler {

    private static handlers: Map<Function, Map<RequestType, HandlerFunction>> = new Map()

    public async handle(request: ASRequest): Promise<ASResponse> {
        let classHandlers = MultiRequestHandler.handlers.get(this.constructor)

        if (!classHandlers || !classHandlers.has(request.constructor as any))
            throw new Error('Cant find request for request: ' + request.constructor.name)

        return classHandlers.get(request.constructor as any)!(request)
    }

    public supports(request: ASRequest): boolean {
        return (
            MultiRequestHandler.handlers.has(this.constructor) &&
            MultiRequestHandler.handlers.get(this.constructor)!.has(request.constructor as any)
        )
    }

    public addHandler(request: RequestType, handlerClass: () => MultiRequestHandlerType, handlerFunction: HandlerFunction) {
        if (!MultiRequestHandler.handlers.has(handlerClass))
            MultiRequestHandler.handlers.set(handlerClass, new Map())

        MultiRequestHandler.handlers.get(handlerClass)!.set(request, handlerFunction)
    }
}

export function handles<T extends MultiRequestHandler>(request: RequestType) {
    return (target: T, propertyKey: string) => {
        let handler = (target as any)[propertyKey] as HandlerFunction

        target.addHandler(request, target.constructor as any, handler)
    }
}