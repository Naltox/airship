import {Type} from "./Type";

export default class CustomType implements Type {
    constructor(readonly name: string) {

    }

    public serialize(): Object {
        return {
            type: 'CustomType',
            name: this.name
        }
    }

    public static deserialize(raw: any): CustomType {
        return new CustomType(raw['name'])
    }
}