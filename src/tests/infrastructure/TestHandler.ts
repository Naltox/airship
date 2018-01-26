import {BaseRequestHandler} from "../../modules/apiServer/domain/BaseRequestHandler";
import TestRequest from "./TestRequest";
import SuccessResponse from "../../modules/apiServer/domain/entity/ASSuccessResponse";
import {ASResponse} from "../../modules/apiServer/domain/entity/ASResponse";

export default class TestHandler extends BaseRequestHandler {
    public async handle(request: Request): Promise<ASResponse> {
        return new SuccessResponse()
    }

    public supports(request: Request): boolean {
        return request instanceof TestRequest
    }
}