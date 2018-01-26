import SourceCode from "../../codeGen/domain/SourceCode"
import ApiSchema from "../../schemeGenerator/domain/ApiSchema";
import {SDKConfig} from "./SDKConfig";

export interface ApiSDKGenerator {
    generateModelsFile(scheme: ApiSchema): SourceCode

    generateResponsesFile(scheme: ApiSchema): SourceCode

    generateMethodsProps(scheme: ApiSchema): SourceCode

    generateApiClassFile(scheme: ApiSchema, config: SDKConfig): SourceCode
}