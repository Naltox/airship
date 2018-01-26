import ClassField from "./ClassField";

export default class ClassScheme {
    constructor(
        readonly name: string,
        readonly fields: ClassField[]
    ) {

    }

    public serialize(): Object {
        return {
            name: this.name,
            fields: this.fields.map(f => f.serialize())
        }
    }

    public static deserialize(raw: any): ClassScheme {
        return new ClassScheme(
            raw['name'],
            raw['fields'].map(ClassField.deserialize)
        )
    }
}