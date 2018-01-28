# Airship Server

# Introduction
Airship is a framework for Node.JS & TypeScript that helps you to write big, scalable and maintainable API servers.

Main features:

- clean and simple architecture
- statically typed
- simple API
- automatic models serialization and deserialization
- automatic API Scheme generation
- automatic SDK generation for the web frontend
- automatic documentation generation
- ability to switch transport protocol (at this moment only HTTP is implemented)

# Basic concepts
The main idea is very simple, every request has its model (its just a class), every response has a model too. To handle request there is a component called `RequestHandler`, every request handler handles a specific request and returns specific response. Its important that at this point whole system does not even know anything about the network and it should not. Because of that, your system is very abstract, it just handles specified requests and returns specified responses. This gives you the ability to change your network protocol or even stop using your system like a web server and use it as a part of local UI application.


# Basic example
Let's imagine that we need a web server with just one method `/randomInt` which returns a random integer in range.

First of all, we need to write our request and response models:

```typescript
export class RandomIntRequest extends ASRequest {
    @json()
    public readonly min: number

    @json()
    public readonly  max: number

    constructor(
        min: number,
        max: number
    ) {
        super()

        this.min = min
        this.max = max
    }
}
```

So, it's pretty simple, we just created a class that extends from base request class and have `from` and `to` properties. The only interesting thing is using of `@json()` decorator,  it's used to have the ability to serialize and deserialize our model.



Response model is also very simple and extends from base response model.

```typescript
export class RandomIntResponse extends ASResponse {
    @json()
    public readonly integer: number

    constructor(integer: number) {
        super()

        this.integer = integer
    }
}
```

Now we need to write a handler for our method, it's also very simple, we just need to write a class that extends from `BaseRequestHandler` class and implement two methods:

```typescript
export class RandomIntHandler extends BaseRequestHandler {
    public async handle(request: RandomIntRequest): Promise<RandomIntResponse> {

        let randomInt = Math.random() * (request.max - request.min) + request.min

        return new RandomIntResponse(randomInt)
    }

    public supports(request: Request): boolean {
        return request instanceof RandomIntRequest
    }
}
```

handle method gets an instance of our request method and returns an instance of response. supports method just tells the system which requests are supported by this handler.

Now we just need to set this up:

```typescript
let logger = new ConsoleLogger()

const server = new AirshipAPIServer({
    requestsProvider: new HttpRequestsProvider(
        logger,
        7000,

        RandomIntRequest
    ),

    requestsHandler: new RequestHandlersManager([
        new RandomIntHandler()
    ])
})

server.start()
```

So the top level component is `AirshipAPIServer`, you need to pass at least two things to it: requests provider which somehow gets request. In our case, we are using `HttpRequestsProvider`, so requests are coming from the network over HTTP at `7000` port. `HttpRequestsProvider` needs a logger, the port, and list of supported request models.

The second required argument is `requestsHandler`, because in our case we have just one method - we could have been passed just an instance of `RandomIntHandler`. But when you have several methods you should use `RequestHandlersManager`, that class itself extends `BaseRequestHandler` and finds which handler can handle any request, you just need to pass your handlers.

The last thing we need to do is start the server, that's it!


# Models serialization

Let's start with example:

```typescript
class Square {
    public width: number

    public height: number

    constructor(
        width: number,
        height: number
    ) {
        this.width = width
        this.height = height
    }
}
```

Here we have simple Square model, first of all if we want this model to be serializable - we need to implement `ISerializable` interface:

```typescript
class Square implements ISerializable {
    public width: number

    public height: number

    constructor(
        width: number,
        height: number
    ) {
        this.width = width
        this.height = height
    }
}
```

Now we need to point our fields using `@serializable` decorator:

```typescript
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
```

`@serializable` decorator is pretty simple:

```typescript
serializable(name?: string, arrayType?: Function)
```

name - is the name of your property, you can leave it empty & system will automatically  detect it, if property name starts with "_" system will replace it with empty string ("_name" -> "name")

`arrayType` - since typescript cant provide us type of array items you should pass it yourself, for example if you have property ids: number[] - `@serializable` call should look like this:

```typescript
@serializable('ids', Number)
public ids: number[]
```

Now we can serialize and `deserialize` our model, there is a `BaseSerializer` class which implements common logic and we have `JSONSerializer` which extends from `BaseSerializer`.

There are two methods that we need:

```typescript
public static serialize(entity: ISerializable): Object

public static deserialize<T extends ISerializable>(
    serializableType: ISerializable & Function,
    raw: { [key: string]: any }
)
```

First one gets your model instance and serializes in, second one `deserializes` it:

```typescript
JSONSerializer.serialize(new Square(10, 10))
// { "width": 10, "height": 10 }
```


```typescript
JSONSerializer.deserialize(Square, { "width": 10, "height": 10 })
// Square { width: 10, height: 10 }
```

`deserialize` method also does type checking and existing checking.