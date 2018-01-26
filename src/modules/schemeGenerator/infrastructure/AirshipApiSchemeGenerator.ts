import {ApiSchemeGenerator, RequestType, ResponseType} from "../domain/ApiSchemeGenerator";
import ApiMethodScheme from "../../codeGen/domain/schema/ApiMethodScheme";
import ClassScheme from "../../codeGen/domain/schema/ClassScheme";
import ApiMethodParam from "../../codeGen/domain/schema/ApiMethodParam";
import CustomType from "../../codeGen/domain/types/CustomType";
import ApiSchema from "../domain/ApiSchema";
import ErrorResponse from "../../apiServer/domain/entity/ASErrorResponse";
import SuccessResponse from "../../apiServer/domain/entity/ASSuccessResponse";
import {BaseSerializer, ISerializable} from "../../serialize/BaseSerializer";

export default class AirshipApiSchemeGenerator implements ApiSchemeGenerator {
    public generateApiScheme(...methods: [RequestType<any>, ResponseType<any>][]): ApiSchema {
        let apiMethodsSchemes: ApiMethodScheme[] = []
        let models: ISerializable & Function[] = []
        let responsesSchemes: ClassScheme[] = []

        methods.forEach(m => {
            let [request, response] = m

            apiMethodsSchemes.push(this.getApiMethodScheme(request, response))

            models.push(...BaseSerializer.getClassDependencies(request))

            if (response != ErrorResponse && response != SuccessResponse) {
                models.push(...BaseSerializer.getClassDependencies(response))
                responsesSchemes.push(BaseSerializer.getClassScheme(response))
            }
        })

        responsesSchemes.push(BaseSerializer.getClassScheme(ErrorResponse))
        models.push(...BaseSerializer.getClassDependencies(ErrorResponse))

        responsesSchemes.push(BaseSerializer.getClassScheme(SuccessResponse))
        models.push(...BaseSerializer.getClassDependencies(SuccessResponse))

        return new ApiSchema(
            Array.from(new Set(models)).map(m => BaseSerializer.getClassScheme(m)),
            apiMethodsSchemes,
            responsesSchemes
        )
    }

    private getApiMethodScheme(
        request: RequestType<any>,
        response: ResponseType<any>
    ): ApiMethodScheme {
        let queryPath = request.getQueryPath()
        let requestScheme = BaseSerializer.getClassScheme(request)

        let params: ApiMethodParam[] = requestScheme.fields.map(field => {
            return new ApiMethodParam(
                field.name,
                field.type,
                true,
                field.description
            )
        })

        let methodScheme = new ApiMethodScheme(
            queryPath
                .split('/')
                .map((name: string, index: number) => {
                    if (index == 0 || index == 1)
                        return name

                    return `${name[0].toUpperCase()}${name.slice(1)}`
                })
                .join(''),
            params,
            new CustomType(response.prototype.constructor.name),
            ''
        )

        return methodScheme
    }
}