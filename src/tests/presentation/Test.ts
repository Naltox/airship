
import {BaseSerializer, ISerializable, serializable} from "../../modules/serialize/BaseSerializer";
import JSONSerializer from "../../modules/serialize/JSONSerializer";

class User implements ISerializable {
    @serializable()
    public id: number

    @serializable()
    public name: string

    @serializable('friendsIds', Number)
    public friendsIds: number[]

    @serializable('test', undefined, true)
    public test: any

    constructor(
        id: number,
        name: string,
        friendsIds: number[],
        test: any
    ) {
        this.id = id
        this.name = name
        this.friendsIds = friendsIds
        this.test = test
    }
}




console.log(
    JSONSerializer.serialize(new User(1, "Test", [1,2,3], 1))
)


console.log(
    JSONSerializer.deserialize(User, { id: 1, name: "123", friendsIds: [1,2, 7], test: 1})
)


console.log(BaseSerializer.getClassScheme(User))


class Square implements ISerializable {
    @serializable()
    public width: number

    @serializable()
    public height: number

    constructor(
        width: number,
        height: number
    ) {
        this.width = width
        this.height = height
    }
}



//
// JSONSerializer.serialize(new Square(10, 10))
//
//
//
// JSONSerializer.deserialize(Square, { "width": 10, "height": 10 })


console.log(JSONSerializer.getClassScheme(Square))