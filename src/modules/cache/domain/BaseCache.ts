export abstract class BaseCache<K, V> {
    /**
     * @param ttl TTL in ms
     */
    public abstract async cache(key: K, value: V|null, ttl?: number): Promise<void>

    public abstract async get(key: K): Promise<V|undefined>

    /**
     * returns TTL in ms
     */
    public abstract async getTTL(key: K): Promise<number>

    public abstract async del(key: K): Promise<number>

    public abstract async setnx(key: K, value: V): Promise<number>

    public abstract async getset(key: K, value: V): Promise<V>

    public abstract async expire(key: K, ttl: number): Promise<V>

    public abstract async keys(key: string): Promise<V[]>

    public abstract async exists(key: K): Promise<boolean>
}