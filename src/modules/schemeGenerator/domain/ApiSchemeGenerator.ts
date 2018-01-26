import {ASResponse} from "../../apiServer/domain/entity/ASResponse";
import {ASRequest} from "../../apiServer/domain/entity/ASRequest";
import ApiSchema from "./ApiSchema";
import {ISerializable} from "../../serialize/BaseSerializer";

export type RequestType<T extends ASRequest & ISerializable> = T
export type ResponseType<T extends ASResponse> = T

export interface ApiSchemeGenerator {
    generateApiScheme(...methods: [ RequestType<any>, ResponseType<any> ][]): ApiSchema

}