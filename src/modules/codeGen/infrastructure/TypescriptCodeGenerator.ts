import {CodeGenerator} from "../domain/CodeGenerator";
import ClassScheme from "../domain/schema/ClassScheme";
import SourceCode from "../domain/SourceCode";
import StringType from "../domain/types/StringType";
import NumberType from "../domain/types/NumberType";
import AnyType from "../domain/types/AnyType";
import BooleanType from "../domain/types/BooleanType";
import CustomType from "../domain/types/CustomType";
import {Type} from "../domain/types/Type";
import VectorType from "../domain/types/VectorType";
import {toCamelCase} from "./Utils";
import ApiMethodScheme from "../domain/schema/ApiMethodScheme";
import IntBoolType from "../domain/types/IntBoolType";

export default class TypescriptCodeGenerator implements CodeGenerator {
    public generateClass(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()
        let constructor = this.generateClassConstructor(scheme)
        let deserializeMethod = this.generateDeserializeMethod(scheme)
        let serializeMethod = this.generateSerializeMethod(scheme)

        code.add(`export class ${scheme.name} {`)
        code.append(constructor, 1)
        code.add('')
        code.append(deserializeMethod, 1)
        code.add('')
        code.append(serializeMethod, 1)
        code.add('}')

        return code
    }

    public generateApiMethod(scheme: ApiMethodScheme): SourceCode {
        let code = new SourceCode()

        let methodName = toCamelCase(scheme.name, false, '.')
        let propsName = `MethodsProps.${toCamelCase(scheme.name, true, '.')}Params`
        let responseName = this.renderType(scheme.responseType, true)


        /**
         * Returns detailed information on users.
         *
         *
         * @param {{
         *   subview:string,
         *   el:(number|Element)
         * }} params
         */

        code.add(`/**`)
        code.add(` * ${scheme.description}`)
        code.add(' *')
        code.add(' * @param {{')
        scheme.params.forEach((param, index) => {
            let coma = this.genComa(scheme.params, index)

            code.add(` *   ${toCamelCase(param.name)}: (${this.renderType(param.type, true)}${param.required ? '' : '|undefined'})${coma}`)
        })
        code.add(' * }} params')
        code.add(' *')
        code.add(` * @returns {Promise<${responseName}>}`)
        code.add(` */`)
        code.add(`public async ${methodName}(params: ${propsName}): Promise<Responses.${responseName}> {`)
        code.add('return this.call(', 1)
        code.add(`'${scheme.name}',`, 2)
        code.add(`{`, 2)
        scheme.params.forEach((param, index) => {
            let coma = this.genComa(scheme.params, index)
            let fieldVar = `${param.name}: params.${param.name}`

            if (param.type instanceof VectorType)
                code.add(`${param.name}: ${this.renderVectorSerialize(`params.${param.name}`, param.type) + coma}`, 3)
            else if (param.type instanceof CustomType)
                code.add(`${fieldVar} ? params.${param.name}.serialize() : undefined${coma}`, 3)
            else
                code.add(fieldVar + coma, 3)



            //code.add(`${param.name}: params.${toCamelCase(param.name)}${coma}`, 3)
        })
        code.add(`},`, 2)
        code.add(`Responses.${responseName}`, 2)
        code.add(')', 1)
        code.add('}')

        return code
    }

    public generateApiMethodParamsInterface(scheme: ApiMethodScheme): SourceCode {
        let code = new SourceCode()

        code.add(`export interface ${toCamelCase(scheme.name, true, '.')}Params {`)

        scheme.params.forEach((prop, index) => {
            let coma = this.genComa(scheme.params, index)
            let isCustom = this.isCustomType(prop.type)

            // code.add(`/**`, 1)
            // code.add(` * ${prop.description}`, 1)
            // code.add(` */`, 1)
            code.add(`${toCamelCase(prop.name)}${prop.required ? '' : '?'}: ${isCustom ? 'Models.' : ''}${this.renderType(prop.type, true)}${coma}`, 1)
        })

        code.add('}')

        return code
    }

    private generateClassConstructor(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()
        let jsdoc = this.generateClassConstructorJSDoc(scheme)

        code.append(jsdoc)

        code.add('constructor (')

        scheme.fields.forEach((field, index) => {
            let coma = this.genComa(scheme.fields, index)

            code.add(`readonly ${toCamelCase(field.name)}: ${this.renderType(field.type)}${coma}`, 1)
        })

        code.add(') {')
        code.add('')
        code.add('}')

        return code
    }

    private generateClassConstructorJSDoc(scheme: ClassScheme): SourceCode {
        let code = new SourceCode()

        code.add('/**')
        code.add(' * @class')


        scheme.fields.forEach(field => {
            let type = this.removeNamespaceFromCustomType(field.type)


            code.add(` * @property {${this.renderType(type)}} ${toCamelCase(field.name)} ${field.description}`)
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

        code.add(`static deserialize(raw: any): ${scheme.name} {`)
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

        code.add(`public serialize(): Object {`)

        code.add(`return {`, 1)


        scheme.fields.forEach((field, index) => {
            let coma = this.genComa(scheme.fields, index)
            let fieldVar = `${field.name}: this.${field.name}`

            if (field.type instanceof VectorType)
                code.add(`${field.name}: ${this.renderVectorSerialize(`this.${field.name}`, field.type) + coma}`, 2)
            else if (field.type instanceof CustomType)
                code.add(`${fieldVar} ? this.${field.name}.serialize() : undefined${coma}`, 2)
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
            code += `${value} ? ${value}.map((v: any) => ${this.renderVectorDeserialize('v', type.item)}) : undefined`
        else if (type instanceof CustomType)
            code += `${value} ? ${type.name}.deserialize(${value}) : undefined`
        else
            code += value

        return code
    }

    private renderVectorSerialize(value: string, type: Type): string {
        let code = ''

        if (type instanceof VectorType)
            code += `${value} ? ${value}.map((v: any) => ${this.renderVectorSerialize('v', type.item)}) : undefined`
        else if (type instanceof CustomType)
            code += `${value} ? ${value}.serialize() : undefined`
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

    private removeNamespaceFromCustomType(type: Type): Type {
        if (type instanceof CustomType)
            return new CustomType(type.name.replace('Models.', ''))
        if (type instanceof VectorType)
            return new VectorType(this.removeNamespaceFromCustomType(type.item))

        return type
    }
}