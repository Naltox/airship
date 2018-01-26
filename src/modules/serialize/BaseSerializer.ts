import 'reflect-metadata'
import VectorType from "../codeGen/domain/types/VectorType";
import CustomType from "../codeGen/domain/types/CustomType";
import AnyType from "../codeGen/domain/types/AnyType";
import ObjectType from "../codeGen/domain/types/ObjectType";
import BooleanType from "../codeGen/domain/types/BooleanType";
import NumberType from "../codeGen/domain/types/NumberType";
import StringType from "../codeGen/domain/types/StringType";
import {Type} from "../codeGen/domain/types/Type";
import ClassScheme from "../codeGen/domain/schema/ClassScheme";
import ClassField from "../codeGen/domain/schema/ClassField";

export const SerializableKey  = 'SerializableKey'
export const SerializableKeys  = 'SerializableKeys'
export const SerializableTypes = 'SerializableTypes'
export const SerializableArrayTypes = 'SerializableArrayTypes'

export function serializable(name?: string, arrayType?: Function, isAny: boolean = false) {
    return (target: Object, propertyKey: string) => {
        const constructor: any = target

        name = name || propertyKey.replace('_', '')

        Reflect.defineMetadata(SerializableKey, name, target, propertyKey)

        constructor[SerializableKeys] = constructor[SerializableKeys] || []
        constructor[SerializableTypes] = constructor[SerializableTypes] || []
        constructor[SerializableArrayTypes] = constructor[SerializableArrayTypes] || []

        let type = Reflect.getMetadata('design:type', target, propertyKey)

        // we need new arrays here, because at this point they are references to super class arrays
        // so just pushing new values would modify super (and other child) class array

        constructor[SerializableKeys] = [...constructor[SerializableKeys], name]
        constructor[SerializableTypes] = [...constructor[SerializableTypes], (isAny ? 'any' : type)]
        constructor[SerializableArrayTypes] = [...constructor[SerializableArrayTypes], arrayType]
    }
}

export interface ISerializable {

}

export abstract class BaseSerializer {
    public static serialize(entity: ISerializable): Object {
        throw new Error('Not implemented')
    }

    public static deserialize<T extends ISerializable>(
        serializableType: ISerializable & Function,
        raw: { [key: string]: any },
        valuePath: string[] = []
    ): T {
        throw new Error('Not implemented')
    }

    public static getClassScheme(serializableType: ISerializable & Function): ClassScheme {
        const serializableConstructor = serializableType.prototype
        let propsNames: string[] = serializableConstructor[SerializableKeys]
        const types = serializableConstructor[SerializableTypes]
        const arrayTypes = serializableConstructor[SerializableArrayTypes]

        let fields: ClassField[] = []

        propsNames = propsNames || []

        propsNames.forEach((propName, index) => {
            fields.push(
                new ClassField(
                    propName,
                    this.getType(types[index], arrayTypes[index]),
                    ''
                )
            )
        })


        return new ClassScheme(
            serializableConstructor.constructor.name,
            fields
        )
    }

    public static getClassDependencies(serializableType: ISerializable & Function): (ISerializable & Function)[]  {
        const serializableConstructor = serializableType.prototype
        const propsNames: string[] = serializableConstructor[SerializableKeys] || []
        const types = serializableConstructor[SerializableTypes]
        const arrayTypes = serializableConstructor[SerializableArrayTypes]

        let dependencies: {[key: string]: (ISerializable & Function)} = {}

        let subDeps: any[] = []

        propsNames.forEach((propName, index) => {
            if (this.isSerializableObject(types[index]) == true) {


                dependencies[types[index].prototype.constructor.name] = types[index]
                subDeps = [...subDeps, ...this.getClassDependencies(types[index])]
            }

            else if (arrayTypes[index] && this.isSerializableObject(arrayTypes[index]) == true) {
                dependencies[arrayTypes[index].prototype.constructor.name] = arrayTypes[index]
                subDeps = [...subDeps, ...this.getClassDependencies(arrayTypes[index])]
            }
        })

        return [...Object.keys(dependencies).map(key => dependencies[key]), ...subDeps]
    }

    protected static isSerializableObject(object: Function): boolean {
        if (object as any == 'any')
            return false

        return !!object.prototype[SerializableKeys]
    }

    protected static getType(propType: any, arrayType?: any): Type {
        if (propType == String)
            return new StringType()
        if (propType == Number)
            return new NumberType()
        if (propType == Boolean)
            return new BooleanType()
        if (propType == Object)
            return new ObjectType()
        if (propType == 'any')
            return new AnyType()
        if (this.isSerializableObject(propType) == true)
            return new CustomType(propType.prototype.constructor.name)
        if (propType == Array && arrayType)
            return new VectorType(this.getType(arrayType))

        throw new Error(`Model scheme generation fail, unknown type: ${propType}`)
    }

    protected static checkType(
        prop: string,
        value: any,
        expectedType: any,
        isSerializable: boolean
    ) {
        if (value == undefined)
            throw new Error(`${prop} argument missing`)

        let valueType = typeof value

        if (expectedType == Array && !Array.isArray(value))
            throw new Error(`${prop} must be array`)

        if (!isSerializable) {
            if (expectedType == String && valueType !== 'string')
                throw new Error(`${prop} must be string instead of ${valueType}`)
            if (expectedType == Number && valueType !== 'number')
                throw new Error(`${prop} must be number instead of ${valueType}`)
            if (expectedType == Boolean && valueType !== 'boolean')
                throw new Error(`${prop} must be boolean instead of ${valueType}`)
            if (expectedType == Object && valueType !== 'object')
                throw new Error(`${prop} must be boolean instead of ${valueType}`)
        }
    }
}