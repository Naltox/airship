import {Type} from "./Type";

export default class ObjectType implements Type {
    public serialize(): Object {
        return {
            type: 'ObjectType'
        }
    }

    public static deserialize(raw: Object): ObjectType {
        return new ObjectType()
    }
}