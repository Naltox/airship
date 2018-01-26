export default class CallbackQueue {
    private _delay: number
    private _queue: Function[] = []

    constructor(countPerSec: number) {
        this._delay = 1000 / countPerSec

        setInterval(() => {
            if(this._queue.length !== 0){
                const func = this._queue.shift()
                if (func) //just to make ts happy
                    func()
            }
        }, this._delay)
    }

    public push(func: Function) {
        this._queue.push(func)
    }
}