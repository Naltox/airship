import {Type} from "./Type";

export default class NumberType implements Type {
    public serialize(): Object {
        return {
            type: 'NumberType'
        }
    }

    public static deserialize(raw: Object): NumberType {
        return new NumberType()
    }
}