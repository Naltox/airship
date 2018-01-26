import {BaseApiDocGenerator} from "../domain/BaseApiDocGenerator";
import SourceCode from "../../codeGen/domain/SourceCode";
import ApiSchema from "../../schemeGenerator/domain/ApiSchema";
import {Type} from "../../codeGen/domain/types/Type";
import NumberType from "../../codeGen/domain/types/NumberType";
import StringType from "../../codeGen/domain/types/StringType";
import CustomType from "../../codeGen/domain/types/CustomType";
import BooleanType from "../../codeGen/domain/types/BooleanType";
import VectorType from "../../codeGen/domain/types/VectorType";
import TypescriptCodeGenerator from "../../codeGen/infrastructure/TypescriptCodeGenerator";
import JavaScriptCodeGenerator from "../../codeGen/infrastructure/JavaScriptCodeGenerator";
import SwiftCodeGenerator from "../../codeGen/infrastructure/SwiftCodeGenerator";

export default class ApiDocGenerator implements BaseApiDocGenerator {
    private tsCodeGenerator = new TypescriptCodeGenerator()
    private jsCodeGenerator = new JavaScriptCodeGenerator()
    private swiftCodeGenerator = new SwiftCodeGenerator()

    public generateApiDoc(scheme: ApiSchema, schemeVersion: number): SourceCode {
        let code = new SourceCode()

        code.add('<html>')
        code.add('<head>')
        code.add(`<link 
            rel="stylesheet" 
            href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" 
            integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" 
            crossorigin="anonymous"
        >`)
        code.add(`<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>`)
        code.add(`<script 
            src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" 
            integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" 
            crossorigin="anonymous"></script>
        `)
        code.add(`<title>V${schemeVersion} API Docs</title>`)
        code.add('</head>')


        code.add('<div class="wrapper container">')
        code.add('<div class="row">')
        code.add('<div class="col-md-2"></div>')
        code.add('<div class="col-md-8">')

        code.add(`<h1>API Docs</h1>`)
        code.add(`<h4>Scheme version: ${schemeVersion}, Generated at ${(new Date()).toString()}</h4>`)
        code.add(`</br>`)

        code.add('<h2>Methods</h2>')

        for (let method of scheme.methods) {
            code.add('<div class="panel panel-primary">')
            code.add(`<div class="panel-heading">${method.name}</div>`)
            code.add('<div class="panel-body">')

            code.add(`<h3>/${method.name}</h3>`)

            code.add('<table class="table">')
            code.add('<thead>')
            code.add('<tr>')
            code.add('<th>Param</th>')
            code.add('<th>Type</th>')
            code.add('</tr>')
            code.add('</thead>')

            code.add('<tbody>')

            for (let param of method.params) {

                code.add('<tr>')
                code.add(`<td>${param.name}</td>`)
                code.add(`<td>${this.renderType(param.type)}</td>`)

                code.add('</tr>')
            }


            code.add('</tbody>')
            code.add('</table>')



            let responseType = scheme.responses.find(r =>
                r.name == (method.responseType as CustomType).name
            )

            if (!responseType)
                throw new Error('Cant find response type' + (method.responseType as CustomType).name)

            code.add(`<h3>Response: ${responseType.name}</h3>`)

            code.add('<table class="table">')
            code.add('<thead>')
            code.add('<tr>')
            code.add('<th>Field</th>')
            code.add('<th>Type</th>')
            code.add('</tr>')
            code.add('</thead>')

            code.add('<tbody>')


            for (let param of responseType.fields) {
                code.add('<tr>')
                code.add(`<td>${param.name}</td>`)
                code.add(`<td>${this.renderType(param.type)}</td>`)

                code.add('</tr>')
            }


            code.add('</tbody>')
            code.add('</table>')

            code.add('</div>')
            code.add('</div>')
        }

        code.add('<h2>Models</h2>')



        for (let model of scheme.models) {
            code.add(`<div class="panel panel-info" id="${model.name}">`)
            code.add(`<div class="panel-heading">${model.name}</div>`)
            code.add('<div class="panel-body">')

            code.add(`<h3>${model.name}</h3>`)

            code.add('<table class="table">')
            code.add('<thead>')
            code.add('<tr>')
            code.add('<th>Param</th>')
            code.add('<th>Type</th>')
            code.add('</tr>')
            code.add('</thead>')

            code.add('<tbody>')

            for (let param of model.fields) {

                code.add('<tr>')
                code.add(`<td>${param.name}</td>`)
                code.add(`<td>${this.renderType(param.type)}</td>`)

                code.add('</tr>')
            }


            code.add('</tbody>')
            code.add('</table>')



            let tsModelCode = new SourceCode()
            tsModelCode.add('<pre>')
            tsModelCode.add(this.tsCodeGenerator.generateClass(model).render())
            tsModelCode.add('</pre>')
            code.append(this.createCollapsablePanel('TS model code', tsModelCode))

            let jsModelCode = new SourceCode()
            jsModelCode.add('<pre>')
            jsModelCode.add(this.jsCodeGenerator.generateClass(model).render())
            jsModelCode.add('</pre>')
            code.append(this.createCollapsablePanel('JS model code', jsModelCode))

            let swiftModelCode = new SourceCode()
            swiftModelCode.add('<pre>')
            swiftModelCode.add(this.swiftCodeGenerator.generateClass(model).render())
            swiftModelCode.add('</pre>')
            code.append(this.createCollapsablePanel('Swift model code', swiftModelCode))

            code.add('</div>')
            code.add('</div>')
        }


        code.add('</div>')
        code.add('</div>')
        code.add('<div class="col-md-2"></div>')
        code.add('</div>')


        code.add('</html>')

        return code
    }

    private renderType(type: Type): string {
        if (type instanceof NumberType)
            return 'number'
        else if (type instanceof StringType)
            return 'string'
        else if (type instanceof CustomType)
            return `<a href="#${type.name}">${type.name}</a>`
        else if (type instanceof BooleanType)
            return 'bool'
        else if (type instanceof VectorType)
            return this.renderType(type.item) + '[ ]'

        throw new Error('Unknown type')
    }

    private createCollapsablePanel(name: string, content: SourceCode): SourceCode {
        let code = new SourceCode()
        let randomId = Math.random().toString(16).replace('.', '')

        code.add('<div class="panel-group">')
            code.add('<div class="panel panel-default">')
                code.add('<div class="panel-heading">')
                    code.add('<h4 class="panel-title">')
                        code.add(`<a data-toggle="collapse" href="#${randomId}">${name}</a>`)
                    code.add('</h4>')
                code.add('</div>')


            code.add(`<div id="${randomId}" class="panel-collapse collapse">`)
            code.add('<div class="panel-body">')
            code.append(content)
            code.add('</div>')
            code.add('</div>')
        code.add('</div>')
        code.add('</div>')

        return code
    }
}