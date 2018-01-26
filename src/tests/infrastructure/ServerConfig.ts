import {TestResponse} from "./MultyHandler";
import SecondTestRequest from "./SecondTestRequest";
import {ApiServerConfig} from "../../modules/apiServer/domain/ServerConfig";

const config: ApiServerConfig = {
    endpoints: [
        [SecondTestRequest, TestResponse],
    ]
}

export default config