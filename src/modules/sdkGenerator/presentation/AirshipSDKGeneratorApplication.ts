import BaseConsoleApplication from "../../utils/BaseConsoleApplication";
import AirshipSDKGenerator from "../application/AirshipSDKGenerator";
import AirshipApiSDKGenerator from "../infrastructure/AirshipApiSDKGenerator";
import ConsoleLogger from "../../logger/infrustructure/ConsoleLogger";
import ApiSchema from "../../schemeGenerator/domain/ApiSchema";
import {mkdirSync, readdirSync} from "fs";

class AirshipSDKGeneratorApplication extends BaseConsoleApplication {
    constructor() {
        super()

        try {
            this.run()
        }
        catch (e) {
            console.log(e)
        }
    }

    private async run() {
        let args: any = this.getArgs()
        let schemePath = args['s']
        let outPath = args['o']

        if (!schemePath || !outPath)
            this.die('usage: --s=<schemes_path> --o=<output_path>')


        let logger = new ConsoleLogger()

        let schemeFiles = await this.readDir(schemePath)
        schemeFiles = schemeFiles.filter(f => f !== '.DS_Store')

        let schemeVersions = schemeFiles
            .map(f =>
                f
                    .replace('api-scheme-v', '')
                    .replace('.json', '')
            )
            .map(v => parseInt(v, 10))
            .sort((a,b) => a-b)

        console.log(schemeVersions)

        logger.log('Found schemes', schemeVersions.map(v => 'V'+v).join(', '))

        let lastSchemeVersion = schemeVersions[schemeVersions.length - 1]

        let lastSchemeFileName = schemeFiles.find(file =>
            file
                .replace('api-scheme-v', '')
                .replace('.json','')
            === String(lastSchemeVersion)
        )

        let schema = await this.readFile(schemePath + '/' + lastSchemeFileName)
        let apiSchema = ApiSchema.deserialize(JSON.parse(schema))



        logger.log('Last scheme:', 'V' + lastSchemeVersion)

        try {
            readdirSync(outPath + `/sdk-v${lastSchemeVersion}/`)
            logger.warn(`Already have SDK for V${lastSchemeVersion}, force generating`)
            //this.die('')
        }
        catch (e) {

        }

        let airshipSDKGenerator = new AirshipSDKGenerator(
            new AirshipApiSDKGenerator(),
            apiSchema,
            {
                sdkName: 'AirshipApi',
                apiPath: '/api/',
                schemeVersion: Number(lastSchemeVersion)
            },
            logger
        )

        let sdk = airshipSDKGenerator.generate()

        let sdkPath = outPath + `/sdk-v${lastSchemeVersion}/`

        try {
            mkdirSync(sdkPath)
        }
        catch (e) {

        }

        for (let file of sdk) {
            logger.log('Saving', file.fileName)
            await this.saveToFile(
                sdkPath + file.fileName,
                file.code.render()
            )
        }

        logger.log('Done')
    }
}

new AirshipSDKGeneratorApplication()