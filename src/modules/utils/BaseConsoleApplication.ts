import {writeFile, readFile, readdir} from "fs";

export default class BaseConsoleApplication {
    protected env = process.env['NODE_ENV'] || 'development'
    protected isProduction = this.env == 'production'

    protected die(error: string) {
        console.error(error)
        process.exit()
    }

    protected getArgs() {
        let result: any = { }

        process.argv.forEach(arg => {
            let test = arg.split('=')

            if (test[0] && test[1] && (test[0][0] + test[0][0]) == '--') {
                result[test[0].replace('--', '')] = test[1]
            }
        })

        return result
    }

    protected async saveToFile(name: string, data: string): Promise<any> {
        return new Promise((resolve, reject) => {
            writeFile(name, data, err => {
                if (err) {
                    reject(err)
                    return
                }

                resolve()
            })
        })
    }

    protected async readFile(name: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            readFile(name, 'utf-8', (err, data) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(data)
            })
        })
    }

    protected async readDir(dir: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            readdir(dir, (err, files) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(files)
            })
        })
    }
}