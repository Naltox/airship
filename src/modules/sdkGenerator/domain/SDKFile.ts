import SourceCode from "../../codeGen/domain/SourceCode";

export default class SDKFile {
    constructor(
        readonly fileName: string,
        readonly code: SourceCode
    ) {

    }
}