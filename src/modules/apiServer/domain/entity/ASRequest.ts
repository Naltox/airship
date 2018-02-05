import "reflect-metadata"
import { Wrapper } from "../../../codeGen/infrastructure/Utils";

export function queryPath(path: string) {
    return (target: any) => {
        let constructor = target

        if (!constructor.queryPath)
            constructor.queryPath = {}
        if (!constructor.queryPath[constructor.name])
            constructor.queryPath[constructor.name] = path
    }
}

export type ASRequestType = Wrapper<typeof ASRequest>

export class ASRequest {
    public static queryPath: string

    public static getQueryPath(): string {
        return (this.queryPath as any)[this.prototype.constructor.name]
    }
}