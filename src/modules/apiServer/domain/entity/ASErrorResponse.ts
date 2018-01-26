import {ASResponse} from "./ASResponse";
import {ISerializable, serializable} from "../../../serialize/BaseSerializer";

export default class ASErrorResponse extends ASResponse implements ISerializable {
    @serializable()
    private _ok: boolean

    @serializable()
    private _error: string

    @serializable()
    private _errorCode: number

    constructor(error: string, errorCode: number = 0) {
        super()
        this._ok = false
        this._error = error
        this._errorCode = errorCode
    }

    public serialize() {
        return {
            ok: false,
            error: this._error,
            errorCode: this._errorCode
        }
    }
}