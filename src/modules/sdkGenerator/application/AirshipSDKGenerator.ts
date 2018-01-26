import {ApiSDKGenerator} from "../domain/ApiSDKGenerator";
import BaseLogger from "../../logger/domain/BaseLogger";
import ApiSchema from "../../schemeGenerator/domain/ApiSchema";
import SDKFile from "../domain/SDKFile";
import {SDKConfig} from "../domain/SDKConfig";

/**
 * AirshipSDKGenerator generates ready to use,
 * fully statically typed TypeScript SDK for fronted
 */
export default class AirshipSDKGenerator {
    private _sdkGenerator: ApiSDKGenerator
    private _apiSchema: ApiSchema
    private _config: SDKConfig
    private _logger: BaseLogger

    constructor(
        sdkGenerator: ApiSDKGenerator,
        apiSchema: ApiSchema,
        config: SDKConfig,
        logger: BaseLogger,
    ) {
        this._sdkGenerator = sdkGenerator
        this._apiSchema = apiSchema
        this._config = config
        this._logger = logger
    }

    public generate(): SDKFile[] {
        let models = new SDKFile('Models.ts', this._sdkGenerator.generateModelsFile(this._apiSchema))
        let responses = new SDKFile('Responses.ts', this._sdkGenerator.generateResponsesFile(this._apiSchema))
        let methodsProps = new SDKFile('MethodsProps.ts', this._sdkGenerator.generateMethodsProps(this._apiSchema))
        let apiClass = new SDKFile('API.ts', this._sdkGenerator.generateApiClassFile(this._apiSchema, this._config))

        return [models, responses, methodsProps, apiClass]
    }
}
