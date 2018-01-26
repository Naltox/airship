import ClassScheme from "./schema/ClassScheme";
import SourceCode from "./SourceCode";
import ApiMethodScheme from "./schema/ApiMethodScheme";

export interface CodeGenerator {
    generateClass(scheme: ClassScheme): SourceCode

    generateApiMethod(scheme: ApiMethodScheme): SourceCode

    generateApiMethodParamsInterface(scheme: ApiMethodScheme): SourceCode
}