import SourceCode from "../domain/SourceCode";
import ClassScheme from "../domain/schema/ClassScheme";
import {CodeGenerator} from "../domain/CodeGenerator";
import {toCamelCase} from "./Utils";
import VectorType from "../domain/types/VectorType";
import CustomType from "../domain/types/CustomType";
import IntBoolType from "../domain/types/IntBoolType";
import {Type} from "../domain/types/Type";
import AnyType from "../domain/types/AnyType";
import NumberType from "../domain/types/NumberType";
import StringType from "../domain/types/StringType";
import BooleanType from "../domain/types/BooleanType";
import ApiMethodScheme from "../domain/schema/ApiMethodScheme";

export default class SwiftCodeGenerator implements CodeGenerator {
    public generateClass(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()
        let props = this.generateProps(scheme)
        let constructor = this.generateClassConstructor(scheme)
        let deserializeMethod = this.generateDeserializeMethod(scheme)
        let serializeMethod = this.generateSerializeMethod(scheme)

        code.add(`class ${scheme.name} {`)
        code.append(props)
        code.add('')
        code.append(constructor, 1)
        code.add('')
        code.append(deserializeMethod, 1)
        code.add('')
        code.append(serializeMethod, 1)
        code.add('}')

        return code
    }

    public generateApiMethod(scheme: ApiMethodScheme): SourceCode {
        throw new Error('Not implemented')
    }

    public generateApiMethodParamsInterface(scheme: ApiMethodScheme): SourceCode {
        throw new Error('Not implemented')
    }

    private generateProps(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()

        scheme.fields.forEach((field, index) => {
            code.add(`public var ${toCamelCase(field.name)}: ${this.renderType(field.type)}`, 1)
        })

        return code
    }

    private generateClassConstructor(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()

        code.add('init (')

        scheme.fields.forEach((field, index) => {
            let coma = this.genComa(scheme.fields, index)

            code.add(`${toCamelCase(field.name)}: ${this.renderType(field.type)}${coma}`, 1)
        })

        code.add(') {')
        scheme.fields.forEach((field, index) => {
            code.add(`self.${toCamelCase(field.name)} = ${toCamelCase(field.name)}`, 1)
        })
        code.add('}')

        return code
    }

    private generateDeserializeMethod(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()

        code.add(`public static func deserialize(raw: [String: Any]?) -> ${scheme.name}? {`)
        code.add(`guard let raw = raw else {`, 1)
        code.add(`return nil`, 2)
        code.add(`}`, 1)
        code.add('')
        code.add(`return ${scheme.name} (`, 1)

        scheme.fields.forEach((field, index) => {
            let coma = this.genComa(scheme.fields, index)
            let fieldVar = `${toCamelCase(field.name)}: raw["${field.name}"] as? ${this.renderNonOptionalType(field.type)}`

            if (field.type instanceof VectorType)
                code.add(this.renderVectorDeserialize(`${toCamelCase(field.name)}: (raw["${field.name}"] as? [Any])`, field.type) + coma, 2)
            else if (field.type instanceof CustomType)
                code.add(`${toCamelCase(field.name)}: ${field.type.name}.deserialize(raw: raw["${field.name}"] as? [String : Any])${coma}`, 2)
            else if (field.type instanceof IntBoolType)
                code.add(`!!${fieldVar}${coma}`, 2)
            else
                code.add(fieldVar + coma, 2)
        })

        code.add(`)`, 1)
        code.add('}')

        return code
    }

    private generateSerializeMethod(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()

        code.add(`public func serialize() -> [String: Any] {`)

        code.add(`return [`, 1)


        scheme.fields.forEach((field, index) => {
            let coma = this.genComa(scheme.fields, index)
            let fieldVar = `"${field.name}": self.${toCamelCase(field.name)}`

            if (field.type instanceof VectorType)
                code.add(`"${field.name}": ${this.renderVectorSerialize(`self.${toCamelCase(field.name)}?`, field.type) + coma}`, 2)
            else if (field.type instanceof CustomType)
                code.add(`${fieldVar}?.serialize()${coma}`, 2)
            else
                code.add(`${fieldVar}${coma}`, 2)
        })


        code.add(']', 1)
        code.add('}')

        return code
    }

    private renderType(type: Type, withoutUndefined = false): string {
        if (type instanceof StringType)
            return 'String?'

        if (type instanceof NumberType)
            return 'Int?'

        // if (type instanceof FloatType)
        //     return 'Float?'

        if (type instanceof AnyType)
            return 'Any?'

        if (type instanceof BooleanType)
            return 'Bool?'

        if (type instanceof IntBoolType)
            return 'Bool?'

        if (type instanceof CustomType)
            return type.name + `${!withoutUndefined ? '?' : ''}`

        if (type instanceof VectorType) {
            return '[' + this.renderNonOptionalType(type.item) + `]${!withoutUndefined ? '?' : ''}`
        }

        throw new Error('UNSUPPORTED TYPE' + JSON.stringify(type))
    }

    private renderNonOptionalType(type: Type): string {
        if (type instanceof StringType)
            return 'String'

        if (type instanceof NumberType)
            return 'Int'

        // if (type instanceof FloatType)
        //     return 'Float'

        if (type instanceof AnyType)
            return 'Any'

        if (type instanceof BooleanType)
            return 'Bool'

        if (type instanceof IntBoolType)
            return 'Bool'

        if (type instanceof CustomType)
            return type.name

        if (type instanceof VectorType) {
            return '[' + this.renderNonOptionalType(type.item) + ']'
        }

        throw new Error('UNSUPPORTED TYPE' + JSON.stringify(type))
    }

    private genComa(list: any[], index: number): string {
        return (index == list.length - 1) ? '' : ','
    }

    private renderVectorDeserialize(value: string, type: Type): string {
        let code = ''

        if (type instanceof VectorType)
            code += `${value}?.flatMap({${this.renderVectorDeserialize('$0', type.item)}})`
        else if (type instanceof CustomType)
            code += `${type.name}.deserialize(raw: ${value} as? [String: Any])`
        else
            code += `${value} as? ${this.renderNonOptionalType(type)}`

        return code
    }

    private renderVectorSerialize(value: string, type: Type): string {
        let code = ''

        if (type instanceof VectorType)
            code += `${value}.map({${this.renderVectorSerialize('$0', type.item)}})`
        else if (type instanceof CustomType)
            code += `${value}.serialize()`
        else
            code += value

        return code
    }

    private isCustomType(type: Type): boolean {
        if (type instanceof CustomType)
            return true
        if (type instanceof VectorType)
            return this.isCustomType(type.item)

        return false
    }

    private getCustomType(type: Type): CustomType | null {
        if (type instanceof VectorType)
            return this.getCustomType(type.item)
        if (type instanceof CustomType)
            return type

        return null
    }
}