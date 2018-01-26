import {Type} from "../types/Type";

export default class ApiMethodParam {
    constructor(
        readonly name: string,
        readonly type: Type,
        readonly required: boolean,
        readonly description: string
    ) {

    }

    public serialize(): Object {
        return {
            name: this.name,
            type: this.type.serialize(),
            required: this.required,
            description: this.description
        }
    }

    public static deserialize(raw: any): ApiMethodParam {
        return new ApiMethodParam(
            raw['name'],
            Type.deserialize(raw['type']),
            raw['required'],
            raw['description']
        )
    }
}