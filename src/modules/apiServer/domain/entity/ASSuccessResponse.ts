import {ASResponse} from "./ASResponse";
import {ISerializable, serializable} from "../../../serialize/BaseSerializer";

export default class ASSuccessResponse extends ASResponse implements ISerializable {
    @serializable()
    private _ok: boolean

    constructor() {
        super()
        this._ok = true
    }
}