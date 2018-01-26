import {queryPath, ASRequest} from "../../modules/apiServer/domain/entity/ASRequest";
import {ASResponse} from "../../modules/apiServer/domain/entity/ASResponse";
import {BaseRequestHandler} from "../../modules/apiServer/domain/BaseRequestHandler";
import {serializable} from "../../modules/serialize/BaseSerializer";

@queryPath('/lol')
export default class SecondTestRequest extends ASRequest {
    @serializable()
    private test: number

    constructor(
        test: number
    ) {
        super()

        this.test = test
    }
}


@queryPath('/lol2')
export class ThirdTestRequest extends ASRequest {
    @serializable()
    private test: number

    constructor(
        test: number
    ) {
        super()

        this.test = test
    }
}


@queryPath('/lol3')
export class TestRequest4 extends ASRequest {
    @serializable()
    private test: number

    constructor(
        test: number
    ) {
        super()

        this.test = test
    }
}


export class RandomIntRequest extends ASRequest {
    @serializable()
    public readonly min: number

    @serializable()
    public readonly  max: number

    constructor(
        min: number,
        max: number
    ) {
        super()

        this.min = min
        this.max = max
    }
}

export class RandomIntResponse extends ASResponse {
    @serializable()
    public readonly integer: number

    constructor(integer: number) {
        super()

        this.integer = integer
    }
}

export class RandomIntHandler extends BaseRequestHandler {
    public async handle(request: RandomIntRequest): Promise<RandomIntResponse> {

        let randomInt = Math.random() * (request.max - request.min) + request.min

        return new RandomIntResponse(randomInt)
    }

    public supports(request: Request): boolean {
        return request instanceof RandomIntRequest
    }
}