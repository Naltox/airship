import {
    BaseSerializer, ISerializable, SerializableArrayTypes, SerializableKey, SerializableKeys,
    SerializableTypes
} from "./BaseSerializer";

export default class JSONSerializer extends BaseSerializer {
    public static deserialize<T extends ISerializable>(
        serializableType: ISerializable & Function,
        raw: { [key: string]: any },
        valuePath: string[] = []
    ): T {
        const serializableConstructor = serializableType.prototype
        const propsNames: string[] = serializableConstructor[SerializableKeys] || []
        const types = serializableConstructor[SerializableTypes]
        const arrayTypes = serializableConstructor[SerializableArrayTypes]

        const props = propsNames.map((prop, index) => {
            let type = types[index]
            let arrayType = arrayTypes[index]
            let isSerializable = super.isSerializableObject(type) == true


            valuePath.push(prop)

            this.checkType(valuePath.join('.'), raw[prop], type, isSerializable)

            if (
                arrayType &&
                super.isSerializableObject(arrayType) == true
            ) {
                let val = raw[prop].map((v: any, i: number) => {
                    valuePath.push(`{${i}}`)

                    let deserialized = JSONSerializer.deserialize(arrayType, v, valuePath)

                    valuePath.pop()

                    return deserialized
                })

                valuePath.pop()

                return val
            }
            else if (arrayType) {
                let val = raw[prop].map((v: any, i: number) => {
                    valuePath.push(`{${i}}`)

                    super.checkType(valuePath.join('.'), v, arrayType, false)
                    valuePath.pop()

                    return v
                })
                valuePath.pop()

                return val
            }
            else if (isSerializable) {
                let val = JSONSerializer.deserialize(type, raw[prop], valuePath)
                valuePath.pop()

                return val
            }
            else {
                valuePath.pop()
                return raw[prop]
            }
        })

        return new serializableConstructor.constructor(...props)
    }

    public static serialize(entity: ISerializable): Object {
        let result: { [key: string]: any} = {}

        let arrayTypes = (entity as any)[SerializableArrayTypes]

        let i = 0

        for(let prop in entity) {
            if (
                prop == SerializableKeys ||
                prop == SerializableTypes ||
                prop == SerializableArrayTypes
            )
                continue

            let keyName = Reflect.getMetadata(SerializableKey, entity, prop) || prop
            let type = Reflect.getMetadata('design:type', entity, prop)
            let arrayType = arrayTypes[i]

            if (arrayType && super.isSerializableObject(arrayType) == true) {
                result[keyName] = ((entity as any)[prop] as any).map(JSONSerializer.serialize)
            }
            else if (super.isSerializableObject(type) == true) {
                result[keyName] = JSONSerializer.serialize((entity as any)[prop])
            }
            else
                result[keyName] = (entity as any)[prop]

            i++
        }

        return result
    }
}

