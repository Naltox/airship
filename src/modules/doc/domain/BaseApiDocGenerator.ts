import ApiSchema from "../../schemeGenerator/domain/ApiSchema";
import SourceCode from "../../codeGen/domain/SourceCode";

export interface BaseApiDocGenerator {
    generateApiDoc(scheme: ApiSchema, schemeVersion: number): SourceCode
}