import {ASRequest} from "./entity/ASRequest";
import {ASResponse} from "./entity/ASResponse";

export interface ApiServerConfig {
    endpoints: [[ASRequest, ASResponse]]
}