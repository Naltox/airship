import CodeLine from "./CodeLine";

export default class SourceCode {
    private _lines: CodeLine[]

    constructor(lines: CodeLine[] = []) {
        this._lines = lines
    }

    public add(data: string, tab: number = 0): SourceCode {
        this._lines.push(new CodeLine(data, tab))
        return this
    }

    public append(code: SourceCode, tab: number = 0) {
        code.tab(tab)
        this._lines.push(...code.lines)
    }

    public render(): string {
        return this._lines.map(line => line.data).join('\n')
    }

    public tab(n: number) {
        this._lines.forEach(line => line.tab(n))
    }

    get lines(): CodeLine[] {
        return this._lines
    }

    private genTab(n: number): string {
        return new Array(n).join('    ')
    }
}