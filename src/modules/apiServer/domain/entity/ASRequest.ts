import "reflect-metadata"
import { Wrapper } from "../../../codeGen/infrastructure/Utils";

export function queryPath(path: string, type?: string) {
    return (target: any) => {
        let constructor = target

        if (!constructor.queryPath)
            constructor.queryPath = {}
        if (!constructor.queryPath[constructor.name])
            constructor.queryPath[constructor.name] = path

        type = type || 'post'

        if (!constructor.queryType)
            constructor.queryType = {}
        if (!constructor.queryType[constructor.name])
            constructor.queryType[constructor.name] = type
    }
}

export type ASRequestType = Wrapper<typeof ASRequest>

export class ASRequest {
    public static queryPath: string
    public static queryType: string

    public static getQueryPath(): string {
        return (this.queryPath as any)[this.prototype.constructor.name]
    }

    public static getQueryType(): string {
        return (this.queryType as any)[this.prototype.constructor.name]
    }
}