import {Type} from "./Type";

export default class AnyType implements Type {
    public serialize(): Object {
        return {
            type: 'AnyType'
        }
    }

    public static deserialize(raw: Object): AnyType {
        return new AnyType()
    }
}