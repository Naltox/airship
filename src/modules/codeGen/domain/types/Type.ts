import AnyType from "./AnyType";
import BooleanType from "./BooleanType";
import CustomType from "./CustomType";
import NumberType from "./NumberType";
import StringType from "./StringType";
import VectorType from "./VectorType";
import ObjectType from "./ObjectType";

export abstract class Type {
    public abstract serialize(): Object

    public static deserialize(raw: any): Type {
        switch (raw['type']) {
            case 'AnyType':
                return AnyType.deserialize(raw)
            case 'BooleanType':
                return BooleanType.deserialize(raw)
            case 'CustomType':
                return CustomType.deserialize(raw)
            case 'NumberType':
                return NumberType.deserialize(raw)
            case 'StringType':
                return StringType.deserialize(raw)
            case 'VectorType':
                return VectorType.deserialize(raw)
            case 'ObjectType':
                return ObjectType.deserialize(raw)
        }

        throw 'UNKNOWN TYPE'
    }
}