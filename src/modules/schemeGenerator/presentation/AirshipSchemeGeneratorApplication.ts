import BaseConsoleApplication from "../../utils/BaseConsoleApplication";
import ConsoleLogger from "../../logger/infrustructure/ConsoleLogger";
import AirshipSchemeGenerator from "../application/AirshipSchemeGenerator";
import AirshipApiSchemeGenerator from "../infrastructure/AirshipApiSchemeGenerator";
import {deepEqual} from "assert";
import {ApiServerConfig} from "../../apiServer/domain/ServerConfig";

class AirshipSchemeGeneratorApplication extends BaseConsoleApplication {
    constructor() {
        super()

        try {
            this.run()
        }
        catch (e) {
            console.error(e)
        }
    }

    private async run() {
        let logger = new ConsoleLogger()

        let airshipApiSchemeGenerator = new AirshipApiSchemeGenerator()


        let args = this.getArgs()
        let path = args['o']
        let configPath = args['c']


        if (!path || !configPath)
            this.die(`usage: --o=<output_path> --c=<config>\n\noutput_path: absolute output path\nconfig: absolute path to config`)

        let config: ApiServerConfig = require(configPath).default

        let schemeFiles = await this.readDir(path)

        let versions = schemeFiles
            .filter(f => f !== '.DS_Store')
            .map(f => f.replace('api-scheme-v', '').replace('.json', ''))
            .sort()


        let generator = new AirshipSchemeGenerator(
            airshipApiSchemeGenerator,
            logger,

            ...config.endpoints
        )

        let v = 1

        try  {
            let scheme = generator.generate()
        }
        catch (e) {
            console.log(e)
        }

        let scheme = generator.generate()

        if (versions.length > 0) {
            v = parseInt(versions[versions.length - 1]) + 1
            let lastScheme = await this.readFile(path + '/api-scheme-v' + versions[versions.length - 1] + '.json')

            try {
                deepEqual(JSON.parse(lastScheme), scheme.serialize())
                logger.warn('scheme-generator', `scheme was not changed since v${v-1}`)
            }
            catch (e) {
                v = parseInt(versions[versions.length - 1]) + 1

                await this.saveToFile(path + '/api-scheme-v' + v + '.json', JSON.stringify(scheme.serialize()))

                logger.log('scheme-generator', `scheme v${v} generated`)
            }
        }
        else {
            await this.saveToFile(path + '/api-scheme-v' + v + '.json', JSON.stringify(scheme.serialize()))
            logger.log('scheme-generator', `scheme v${v} generated`)
        }
    }
}

new AirshipSchemeGeneratorApplication()