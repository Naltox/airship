import ClassScheme from "../../codeGen/domain/schema/ClassScheme";
import ApiMethodScheme from "../../codeGen/domain/schema/ApiMethodScheme";

export default class ApiSchema {
    constructor(
        readonly models: ClassScheme[],
        readonly methods: ApiMethodScheme[],
        readonly responses: ClassScheme[]
    ) {

    }

    public serialize(): Object {
        return {
            models: this.models.map(m => m.serialize()),
            methods: this.methods.map(m => m.serialize()),
            responses: this.responses.map(r => r.serialize())
        }
    }

    public static deserialize(raw: any): ApiSchema {
        return new ApiSchema(
            raw['models'].map(ClassScheme.deserialize),
            raw['methods'].map(ApiMethodScheme.deserialize),
            raw['responses'].map(ClassScheme.deserialize)
        )
    }
}