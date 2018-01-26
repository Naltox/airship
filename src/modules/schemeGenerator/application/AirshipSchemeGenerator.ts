import AirshipApiSchemeGenerator from "../infrastructure/AirshipApiSchemeGenerator";
import BaseLogger from "../../logger/domain/BaseLogger";
import {RequestType, ResponseType} from "../domain/ApiSchemeGenerator";
import ApiSchema from "../domain/ApiSchema";

/**
 * AirshipSchemeGenerator Generates API Server scheme
 */
export default class AirshipSchemeGenerator {
    private _airshipApiSchemeGenerator: AirshipApiSchemeGenerator
    private _logger: BaseLogger
    private _methods: [RequestType<any>, ResponseType<any>][]

    constructor(
        airshipApiSchemeGenerator: AirshipApiSchemeGenerator,
        logger: BaseLogger,
        ...methods: [RequestType<any>, ResponseType<any>][]
    ) {
        this._airshipApiSchemeGenerator = airshipApiSchemeGenerator
        this._logger = logger
        this._methods = methods
    }

    public generate(): ApiSchema {
        return this._airshipApiSchemeGenerator.generateApiScheme(...this._methods)
    }
}