import {CodeGenerator} from "../domain/CodeGenerator";
import ClassScheme from "../domain/schema/ClassScheme";
import SourceCode from "../domain/SourceCode";
import {Type} from "../domain/types/Type";
import CustomType from "../domain/types/CustomType";
import {toCamelCase} from "./Utils";
import VectorType from "../domain/types/VectorType";
import IntBoolType from "../domain/types/IntBoolType";
import StringType from "../domain/types/StringType";
import NumberType from "../domain/types/NumberType";
import AnyType from "../domain/types/AnyType";
import BooleanType from "../domain/types/BooleanType";
import ApiMethodScheme from "../domain/schema/ApiMethodScheme";

export default class JavaScriptCodeGenerator implements CodeGenerator {
    public generateClass(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()
        let imports = this.generateImports(scheme)
        let constructor = this.generateClassConstructor(scheme)
        let deserializeMethod = this.generateDeserializeMethod(scheme)
        let serializeMethod = this.generateSerializeMethod(scheme)

        code.append(imports)
        code.add('')
        code.add(`class ${scheme.name} {`)
        code.append(constructor, 1)
        code.add('')
        code.append(deserializeMethod, 1)
        code.add('')
        code.append(serializeMethod, 1)
        code.add('}')
        code.add('')
        code.add(`module.exports = ${scheme.name}`)

        return code
    }

    public generateApiMethod(scheme: ApiMethodScheme): SourceCode {
        throw new Error('Not implemented')
    }

    public generateApiMethodParamsInterface(scheme: ApiMethodScheme): SourceCode {
        throw new Error('Not implemented')
    }

    private generateImports(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()

        scheme.fields.forEach((field, index) => {
            let customType = this.getCustomType(field.type)

            if (customType) {
                code.add(`const ${customType.name} = require('./${customType.name}')`)
            }
        })

        return code
    }

    private generateClassConstructor(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()
        let jsdoc = this.generateClassConstructorJSDoc(scheme)

        code.append(jsdoc)

        code.add('constructor (')

        scheme.fields.forEach((field, index) => {
            let coma = this.genComa(scheme.fields, index)

            code.add(`${toCamelCase(field.name)}${coma}`, 1)
        })

        code.add(') {')
        scheme.fields.forEach((field, index) => {
            code.add(`this.${toCamelCase(field.name)} = ${toCamelCase(field.name)}`, 1)
        })
        code.add('}')

        return code
    }

    private generateClassConstructorJSDoc(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()

        code.add('/**')
        code.add(' * @class')

        scheme.fields.forEach(field => {
            code.add(` * @property {${this.renderType(field.type)}} ${toCamelCase(field.name)} ${field.description}`)
        })

        code.add(' */')

        return code
    }

    private generateDeserializeMethod(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()

        code.add('/**')
        code.add(' * @param {Object} raw')
        code.add(` * @returns {${scheme.name}}`)
        code.add(' */')

        code.add(`static deserialize(raw) {`)
        code.add(`return new ${scheme.name} (`, 1)

        scheme.fields.forEach((field, index) => {
            let coma = this.genComa(scheme.fields, index)
            let fieldVar = `raw['${field.name}']`

            if (field.type instanceof VectorType)
                code.add(this.renderVectorDeserialize(fieldVar, field.type) + coma, 2)
            else if (field.type instanceof CustomType)
                code.add(`${fieldVar} ? ${field.type.name}.deserialize(${fieldVar}) : undefined${coma}`, 2)
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

        code.add('/**')
        code.add(` * @returns {Object}`)
        code.add(' */')

        code.add(`serialize() {`)

        code.add(`return {`, 1)


        scheme.fields.forEach((field, index) => {
            let coma = this.genComa(scheme.fields, index)
            let fieldVar = `${field.name}: this.${toCamelCase(field.name)}`

            if (field.type instanceof VectorType)
                code.add(`${field.name}: ${this.renderVectorSerialize(`this.${toCamelCase(field.name)}`, field.type) + coma}`, 2)
            else if (field.type instanceof CustomType)
                code.add(`${fieldVar} ? this.${toCamelCase(field.name)}.serialize() : undefined${coma}`, 2)
            else
                code.add(fieldVar + coma, 2)
        })


        code.add('}', 1)
        code.add('}')

        return code
    }

    private renderType(type: Type, withoutUndefined = false): string {
        if (type instanceof StringType)
            return 'string'

        if (type instanceof NumberType)
            return 'number'

        if (type instanceof AnyType)
            return 'any'

        if (type instanceof BooleanType)
            return 'boolean'

        if (type instanceof IntBoolType)
            return 'boolean'

        if (type instanceof CustomType)
            return type.name + `${!withoutUndefined ? '|undefined' : ''}`

        if (type instanceof VectorType) {
            return this.renderType(type.item, true) + `[]${!withoutUndefined ? '|undefined' : ''}`
        }

        throw new Error('UNSUPPORTED TYPE' + JSON.stringify(type))
    }

    private genComa(list: any[], index: number): string {
        return (index == list.length - 1) ? '' : ','
    }

    private renderVectorDeserialize(value: string, type: Type): string {
        let code = ''

        if (type instanceof VectorType)
            code += `${value} ? ${value}.map(v => ${this.renderVectorDeserialize('v', type.item)}) : undefined`
        else if (type instanceof CustomType)
            code += `${value} ? ${type.name}.deserialize(${value}) : undefined`
        else
            code += value

        return code
    }

    private renderVectorSerialize(value: string, type: Type): string {
        let code = ''

        if (type instanceof VectorType)
            code += `${value} ? ${value}.map(v => ${this.renderVectorSerialize('v', type.item)}) : undefined`
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