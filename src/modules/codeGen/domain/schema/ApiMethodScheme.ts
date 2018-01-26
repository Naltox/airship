import ApiMethodParam from "./ApiMethodParam";
import {Type} from "../types/Type";

export default class ApiMethodScheme {
    constructor(
        readonly name: string,
        readonly params: ApiMethodParam[],
        readonly responseType: Type,
        readonly description: string
    ) {

    }

    public serialize(): Object {
        return {
            name: this.name,
            params: this.params.map(p => p.serialize()),
            responseType: this.responseType.serialize(),
            description: this.description
        }
    }

    public static deserialize(raw: any): ApiMethodScheme {
        return new ApiMethodScheme(
            raw['name'],
            raw['params'].map(ApiMethodParam.deserialize),
            Type.deserialize(raw['responseType']),
            raw['description']
        )
    }
}