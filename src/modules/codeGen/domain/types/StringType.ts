import {Type} from "./Type";

export default class StringType implements Type {
    public serialize(): Object {
        return {
            type: 'StringType'
        }
    }

    public static deserialize(raw: Object): StringType {
        return new StringType()
    }
}