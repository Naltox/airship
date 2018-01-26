import BaseConsoleApplication from "../../utils/BaseConsoleApplication";
import ConsoleLogger from "../../logger/infrustructure/ConsoleLogger";
import ApiSchema from "../../schemeGenerator/domain/ApiSchema";
import {mkdirSync, readdirSync} from "fs";
import ApiDocGenerator from "../infrastructure/ApiDocGenerator";

class DocsGeneratorApplication extends BaseConsoleApplication {
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
            this.die('usage: --s=<scheme_file> --c=<output_path>')

        let logger = new ConsoleLogger()

        let docGenerator = new ApiDocGenerator()

        let schemeFiles = await this.readDir(schemePath)
        schemeFiles = schemeFiles.filter(f => f !== '.DS_Store')

        let schemeVersions = schemeFiles
            .map(f => f.replace('api-scheme-v', '').replace('.json', ''))
            .sort()

        logger.log('Found schemes', schemeVersions.map(v => 'V'+v).join(', '))

        let schema = await this.readFile(schemePath + '/' + schemeFiles[schemeFiles.length -1])
        let apiSchema = ApiSchema.deserialize(JSON.parse(schema))

        let lastSchemeVersion = schemeVersions[schemeVersions.length - 1]

        logger.log('Last scheme:', 'V' + lastSchemeVersion)


        try {
            readdirSync(outPath + `/sdk-v${lastSchemeVersion}/`)
            logger.warn(`Already have Doc for V${lastSchemeVersion}, force regenerating`)
        }
        catch (e) {

        }


        let docs = docGenerator.generateApiDoc(apiSchema, Number(lastSchemeVersion))

        let docPath = outPath + `/api-doc-v${lastSchemeVersion}/`

        try {
            mkdirSync(docPath)
        }
        catch (e) {

        }

        await this.saveToFile(
            docPath + 'docs.html',
            docs.render()
        )

        logger.log('Done')
    }
}

new DocsGeneratorApplication()