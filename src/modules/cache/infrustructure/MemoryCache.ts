import {BaseCache} from "../domain/BaseCache";

export default class MemoryCache<K, V> extends BaseCache<K, V> {
    private _storage: Map<K, V>

    private _ttls: Map<K, { started: number, ttl: number }>

    constructor() {
        super()
        this._storage = new Map()
        this._ttls = new Map()
    }

    public async cache(key: K, value: V, ttl?: number) {
        this._storage.set(key, value)

        if (!ttl)
            return

        this._ttls.set(key, {
            started: Date.now(),
            ttl
        })

        setTimeout(() => {
            this._ttls.delete(key)
            this._storage.delete(key)
        }, ttl )
    }

    public async get(key: K): Promise<V|undefined> {
        return this._storage.get(key)
    }

    public async getTTL(key: K): Promise<number> {
        let ttlInfo = this._ttls.get(key)

        if (!ttlInfo)
            return -1

        let delta = Date.now() - ttlInfo.started

        if (delta > ttlInfo.ttl)
            return 0
        else
            return ttlInfo.ttl - delta
    }

    public async del(key: K): Promise<number> {
        throw new Error('not implemented')
    }

    public async setnx(key: K, value: V): Promise<number> {
        throw new Error('not implemented')
    }

    public async getset(key: K, value: V): Promise<V> {
        throw new Error('not implemented')
    }

    public async expire(key: K, ttl: number): Promise<V> {
        throw new Error('not implemented')
    }

    public async keys(key: string): Promise<V[]> {
        throw new Error('not implemented')
    }

    public async exists(key: K): Promise<boolean> {
        throw new Error('not implemented')
    }
}