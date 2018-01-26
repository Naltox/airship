import {Type} from "./Type";

export default class VectorType implements Type {
    constructor(readonly item: Type) {

    }

    public serialize(): Object {
        return {
            type: 'VectorType',
            item: this.item.serialize()
        }
    }

    public static deserialize(raw: any): VectorType {
        return new VectorType(Type.deserialize(raw['item']))
    }
}