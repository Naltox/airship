export default class CodeLine {
    private _data: string

    constructor(data: string, tab: number = 0) {
        this._data = this.genTab(tab) + data
    }

    get data(): string {
        return this._data
    }

    public tab(n: number) {
        this._data = this.genTab(n) + this._data
    }

    private genTab(n: number): string {
        return new Array(n).fill('    ').join('')
    }
}