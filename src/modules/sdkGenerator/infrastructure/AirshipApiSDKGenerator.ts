import {ApiSDKGenerator} from "../domain/ApiSDKGenerator";
import SourceCode from "../../codeGen/domain/SourceCode";
import {CodeGenerator} from "../../codeGen/domain/CodeGenerator";
import TypescriptCodeGenerator from "../../codeGen/infrastructure/TypescriptCodeGenerator";
import ApiSchema from "../../schemeGenerator/domain/ApiSchema";
import {SDKConfig} from "../domain/SDKConfig";
import CustomType from "../../codeGen/domain/types/CustomType";
import ClassScheme from "../../codeGen/domain/schema/ClassScheme";
import ClassField from "../../codeGen/domain/schema/ClassField";
import VectorType from "../../codeGen/domain/types/VectorType";
import {Type} from "../../codeGen/domain/types/Type";

export default class AirshipApiSDKGenerator implements ApiSDKGenerator {
    private _codeGenerator: CodeGenerator

    constructor() {
        this._codeGenerator = new TypescriptCodeGenerator()
    }

    public generateModelsFile(scheme: ApiSchema): SourceCode {
        let code = new SourceCode()

        scheme.models.forEach(m => {
            code.append(this._codeGenerator.generateClass(m))
            code.add('')
        })

        return code
    }

    public generateResponsesFile(scheme: ApiSchema): SourceCode {
        let code = new SourceCode()

        code.add(`import * as Models from './Models'`)
        code.add('')

        function prepareType(type: Type): Type {
            if (type instanceof CustomType)
                return new CustomType(`Models.${type.name}`)
            if (type instanceof VectorType)
                return new VectorType(prepareType(type.item))

            return type
        }

        scheme.responses.forEach(r => {
            let fields = r.fields.map(f => {
                return new ClassField(
                    f.name,
                    prepareType(f.type),
                    f.description
                )
            })
            code.append(this._codeGenerator.generateClass(new ClassScheme(r.name, fields)))
            code.add('')
        })

        return code
    }

    public generateMethodsProps(scheme: ApiSchema): SourceCode {
        let code = new SourceCode()

        code.add(`import * as Models from './Models'`)
        code.add('')

        scheme.methods.forEach(m => {
            code.append(this._codeGenerator.generateApiMethodParamsInterface(m))
            code.add('')
        })

        return code
    }

    public generateApiClassFile(scheme: ApiSchema, config: SDKConfig): SourceCode {
        let code = new SourceCode()

        code
            .add('/**')
            .add(' *  This is an automatically generated code (and probably compiled with TSC)')
            .add(` *  Generated at ${(new Date()).toString()}`)
            .add(` *  Scheme version: ${config.schemeVersion}`)
            .add(' */')
            .add(`const API_PATH = '${config.apiPath}'`)
            .add(``)
            .add(`import * as Responses from './Responses'`)
            .add(`import * as MethodsProps from './MethodsProps'`)
            .add('')
            .add(`export default class ${config.sdkName} {`)
            .add(`public async call(method: string, params: Object, responseType?: Function): Promise<any> {`, 1)
            .add('return fetch(', 2)
            .add(`API_PATH + method,`, 3)
            .add(`{`, 3)
            .add(`method: 'POST',`, 4)
            .add(`body: JSON.stringify(params),`, 4)
            .add(`headers: {`, 4)
            .add(`'Content-Type': 'application/json'`, 5)
            .add(`}`, 4)
            .add(`}`, 3)
            .add(`)`, 2)
            .add(`.then(r => {`, 3)
            .add(`return r.json()`, 4)
            .add(`})`, 3)
            .add(`.then(json => {`, 3)
            .add(`if (json.ok == false)`, 4)
            .add(`throw Responses.ErrorResponse.deserialize(json)`, 5)
            .add(`else`, 4)
            .add(`return json`, 5)
            .add(`})`, 3)
            .add(`.then(data => {`, 3)
            .add(`if (responseType)`, 4)
            .add(`return (responseType as any).deserialize(data)`, 5)
            .add('')
            .add(`return data`, 4)
            .add(`})`, 3)
            .add(`}`, 1)
            .add('')

        scheme.methods.forEach(m => {
            code.append(this._codeGenerator.generateApiMethod(m), 1)
        })

        code.add('}')

        return code
    }
}