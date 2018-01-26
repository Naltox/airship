import {Type} from "./Type";

export default class BooleanType implements Type {
    public serialize(): Object {
        return {
            type: 'BooleanType'
        }
    }

    public static deserialize(raw: Object): BooleanType {
        return new BooleanType()
    }
}