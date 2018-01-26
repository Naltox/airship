export abstract class BaseStatisticsCounter {
    public abstract countRequestHit(): void

    public abstract doneRequest(): void
}