import BaseConsoleApplication from "../../modules/utils/BaseConsoleApplication";
import ConsoleLogger from "../../modules/logger/infrustructure/ConsoleLogger";
import RequestHandlersManager from "../../modules/apiServer/infrastructure/RequestHandlersManager";
import HttpRequestsProvider from "../../modules/apiServer/infrastructure/HttpRequestsProvider";
import LocalStatisticsCounter from "../../modules/statistics/infrastructure/LocalStatisticsCounter";
import TestRequest from "../infrastructure/TestRequest";
import TestHandler from "../infrastructure/TestHandler";
import {ASRequest} from "../../modules/apiServer/domain/entity/ASRequest";
import BaseLogger from "../../modules/logger/domain/BaseLogger";
import {BaseStatisticsCounter} from "../../modules/statistics/domain/BaseStatisticsCounter";
import {RequestsProvider} from "../../modules/apiServer/domain/RequestsProvider";
import {ASResponse} from "../../modules/apiServer/domain/entity/ASResponse";
import {BaseRequestHandler} from "../../modules/apiServer/domain/BaseRequestHandler";
import SecondTestRequest, {
    RandomIntHandler, RandomIntRequest, TestRequest4,
    ThirdTestRequest
} from "../infrastructure/SecondTestRequest";
import MultyHandler, {MultyHandler2} from "../infrastructure/MultyHandler";
import AirshipAPIServer from "../../modules/apiServer/application/AirshipAPIServer";



type Wrapper<T> = { [P in keyof T]: T[P] }

type RequestType = Wrapper<typeof ASRequest>
type ResponseType = Wrapper<typeof ASResponse>
type HandlerType = Wrapper<typeof BaseRequestHandler>

interface APIMethod {
    handler: HandlerType,
    request: RequestType,
    response: ResponseType
}

interface AirshipAPIServerConfig {
    productionPort: number,
    testPort?: number,
    developmentPort?: number,

    logger: BaseLogger,
    statisticsCounter: BaseStatisticsCounter,
    requestsProvider: RequestsProvider,

    methods: APIMethod[]
}


let logger = new ConsoleLogger()

// const CONFIG: AirshipAPIServerConfig = {
//     productionPort: 7000,
//     testPort: 7000,
//     developmentPort: 7000,
//
//     logger: logger,
//     statisticsCounter: new LocalStatisticsCounter(logger, true),
//     requestsProvider: new HttpRequestsProvider(
//         logger,
//         serverPort[env],
//
//         TestRequest
//     ),
//
//     methods: APIMethod[]
// }

class HHEventsServerApplication extends BaseConsoleApplication {
    constructor() {
        super()

        const env = process.env['NODE_ENV'] || 'development'


        const serverPort: any = {
            'production': 7000,
            'test': 7000,
            'development': 7000,
        }

        // let logger
        //
        // logger = new ConsoleLogger()
        //
        //
        // let statisticsCounter = new LocalStatisticsCounter(logger, true)
        //
        //
        //
        // const manager = new RequestHandlersManager([
        //     new TestHandler(),
        //     new MultyHandler(),
        //     new MultyHandler2()
        // ])
        //
        //
        //
        // const SERVER_CONFIG = {
        //
        // }

        // const server = new AirshipAPIServer({
        //     requestsProvider: new HttpRequestsProvider(
        //         logger,
        //         serverPort[env],
        //
        //         TestRequest,
        //         SecondTestRequest,
        //         ThirdTestRequest,
        //         TestRequest4
        //     ),
        //
        //     requestsHandler: manager
        // })
        //
        // server.start()

        let logger = new ConsoleLogger()

        const server = new AirshipAPIServer({
            requestsProvider: new HttpRequestsProvider(
                logger,
                7000,

                RandomIntRequest
            ),

            requestsHandler: new RequestHandlersManager([
                new RandomIntHandler()
            ])
        })

        server.start()
    }
}

new HHEventsServerApplication()