import {queryPath, ASRequest} from "../../modules/apiServer/domain/entity/ASRequest";
import {serializable} from "../../modules/serialize/BaseSerializer";

@queryPath('/test')
export default class TestRequest extends ASRequest {
    @serializable()
    private test: number

    constructor(
        test: number
    ) {
        super()

        this.test = test
    }
}