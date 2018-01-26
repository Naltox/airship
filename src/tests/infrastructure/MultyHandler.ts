import {MultiRequestHandler, handles} from "../../modules/apiServer/infrastructure/MultyRequestHandler";
import SecondTestRequest, {TestRequest4, ThirdTestRequest} from "./SecondTestRequest";
import {ASRequest} from "../../modules/apiServer/domain/entity/ASRequest";
import {ASResponse} from "../../modules/apiServer/domain/entity/ASResponse";
import {serializable} from "../../modules/serialize/BaseSerializer";

export class TestResponse {
    @serializable()
    private _test: number

    constructor(test: number) {
        this._test = test
    }
}


export default class MultyHandler extends MultiRequestHandler {
    @handles(SecondTestRequest)
    public async handleTest(request: ASRequest): Promise<ASResponse> {
        return new TestResponse(Math.random())
    }

    @handles(ThirdTestRequest)
    public async handleTestThird(request: ASRequest): Promise<ASResponse> {
        return new TestResponse(77)
    }
}

export class MultyHandler2 extends MultiRequestHandler {
    @handles(TestRequest4)
    public async handleTest(request: ASRequest): Promise<ASResponse> {
        return new TestResponse(1111)
    }
}