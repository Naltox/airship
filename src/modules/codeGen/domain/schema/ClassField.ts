import {Type} from "../types/Type";

export default class ClassField {
    constructor(
        readonly name: string,
        readonly type: Type,
        readonly description: string
    ) {

    }

    public serialize(): Object {
        return {
            name: this.name,
            type: this.type.serialize(),
            description: this.description
        }
    }

    public static deserialize(raw: any): ClassField {
        return new ClassField(
            raw['name'],
            Type.deserialize(raw['type']),
            raw['description']
        )
    }
}