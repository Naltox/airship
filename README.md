# Airship

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

```ts
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

```ts
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

```ts
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

```ts
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

```ts
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

```ts
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

```ts
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

```ts
serializable(name?: string, arrayType?: Function)
```

name - is the name of your property, you can leave it empty & system will automatically  detect it, if property name starts with "_" system will replace it with empty string ("_name" -> "name")

`arrayType` - since typescript cant provide us type of array items you should pass it yourself, for example if you have property ids: number[] - `@serializable` call should look like this:

```ts
@serializable('ids', Number)
public ids: number[]
```

Now we can serialize and `deserialize` our model, there is a `BaseSerializer` class which implements common logic and we have `JSONSerializer` which extends from `BaseSerializer`.

There are two methods that we need:

```ts
public static serialize(entity: ISerializable): Object

public static deserialize<T extends ISerializable>(
    serializableType: ISerializable & Function,
    raw: { [key: string]: any }
)
```

First one gets your model instance and serializes in, second one `deserializes` it:

```ts
JSONSerializer.serialize(new Square(10, 10))
// { "width": 10, "height": 10 }
```


```ts
JSONSerializer.deserialize(Square, { "width": 10, "height": 10 })
// Square { width: 10, height: 10 }
```

`deserialize` method also does type checking and existing checking.


# Logger

There is a `BaseLogger` interface that specifies basic logging capabilities: 

```ts
export default interface BaseLogger {
    log(prefix: string, data?: any, recursiveDepth?: boolean): void

    warn(prefix: string, data?: any, recursiveDepth?: boolean): void

    error(prefix: string, data?: any, recursiveDepth?: boolean): void
}
```

You can implement your own logger using this interface or you can use `ConsoleLogger` which implements `BaseLogger` and writes logs to `stdout` & `stderr`

# Handlers

There are two ways to write handlers at this moment. The first option is to extend  `BaseRequestHandler`: 

```ts 
export default class TestHandler extends BaseRequestHandler {
    // here you handle request and return response
    // it's better to specify concrete types of request & response
    public async handle(request: TestRequest): Promise<SuccessResponse|ErrorResponse> {
        return new SuccessResponse()
    }

    // here you must return true if you support request 
    public supports(request: Request): boolean {
        return request instanceof TestRequest
    }
}
```

Because `BaseRequestHandler` is on great for handling multiply request - there is an subclass of it called `MultiRequestHandler`.
You can use `MultiRequestHandler` like this: 

```ts

export default class UsersHandler extends MultiRequestHandler {
    // here you pass your request class to handles decorator
    @handles(GetUserRequest)
    // all GetUserRequest`s will be passed to this method at this moment
    public async handleGetUser(request: GetUserRequest): Promise<ASResponse> {
        
    }

    @handles(SaveUserRequest)
    public async handleSaveUser(request: SaveUserRequest): Promise<ASResponse> {
    
    }
}
```

All requests are subclasses of `ASRequest` and all responses are subclasses of `ASResponse`.
There are two already implemented responses: 

- ASSuccessResponse 
- ASErrorResponse 

# Cache

There is a `BaseCache` abstract class which specifies basic caching capabilities:

```ts
export abstract class BaseCache<K, V> {
    public abstract async cache(key: K, value: V|null, ttl?: number): Promise<void>

    public abstract async get(key: K): Promise<V|undefined>

    public abstract async getTTL(key: K): Promise<number>

    public abstract async del(key: K): Promise<number>

    public abstract async setnx(key: K, value: V): Promise<number>

    public abstract async getset(key: K, value: V): Promise<V>

    public abstract async expire(key: K, ttl: number): Promise<V>

    public abstract async keys(key: string): Promise<V[]>

    public abstract async exists(key: K): Promise<boolean>
}
```

You can implement your own cache using this interface or you can use `MemoryCache` which implements `BaseCache` and stores data in memory (not all methods are implemented in `MemoryCache`). 
`BaseCache` is not used in system, but it's may be useful in your project.

# API Server

Main logic for API Server is implemented at `AirshipAPIServer`, implementation is pretty simple: it just wait's for requests from `RequestsProvider`, passes them to `BaseRequestHandler` and returns responses back to `RequestsProvider`.

To create server you need to pass config object to `AirshipAPIServer` constructor, config object must mach this interface: 

```ts
export interface AirshipAPIServerConfig {
    // Your requests handler
    requestsHandler: BaseRequestHandler,
    // Your RequestsProvider e.g. HttpRequestsProvider
    requestsProvider: RequestsProvider,
    // optional statistics counter
    statisticsCounter?: BaseStatisticsCounter,
    // optional logger
    logger?: BaseLogger
}
```

Because `AirshipAPIServer` uses just one request handler it's expected that handler is capable of handling all types of request of your system.
There is a subclass of `BaseRequestHandler` called `RequestHandlerManager` for that purposes. `RequestHandlerManager` receives array of all of your handlers and passes each request to handler that supports it. 

# Requests provider

Request provider is a component thet provides requests to `AirshipAPIServer`. There is a `RequestsProvider` class: 

```ts
export abstract class RequestsProvider {
    public abstract getRequests(
        callback: (
            request: ASRequest,
            answerRequest: (response: ASResponse) => void
        ) => void
    ): void
}
```

`getRequests` method is called by `AirshipAPIServer` to subscribe to requests, response for request is returned by `AirshipAPIServer` to `answerRequest` function.

At this moment we have requests provider for http: `HttpRequestsProvider`, it uses `dietjs` module for networking.
Usage is pretty simple: 

```ts
new HttpRequestsProvider(
        logger, // instance of BaseLogger
        7000,   // port

        // list of your requests
        GetUserRequest,
        SaveUserRequest
    )
```

Feel free to create more requests providers!

# Statistics

If you pass subclass of `BaseStatisticsCounter` to `AirshipAPIServer` server will call `countRequestHit` when request comes and `doneRequest` when request handled.
There is a subclass called `LocalStatisticsCounter` which prints stats using your logger:

```ts
let statsCounter = new LocalStatisticsCounter(
    logger,
    false, // silence flag, handy for debugging
    1000 * 60 // logFrequency in ms, default is 5000 
)
```

# Generating api scheme

What is api scheme? It's a json file which describes your server models, responses and requests. Api scheme is used to generate client adk & docs.
To generate scheme first you need to create config file which implements `ApiServerConfig` interface:

```ts
import {AirshipAPIServerConfig} from "airship-server"

const config: ApiServerConfig = {
    endpoints: [
        [TestRequest, TestResponse],
        [GetUserRequest, GetUserResponse]
    ]
}

export default config
```

`endpoints` is just and array of request response pairs.

After you done with that you can use `aschemegen` tool to generate scheme:

```bash
node_modules/.bin/aschemegen  --o=/Users/altox/Desktop/test-server/scheme  --c=/Users/altox/Desktop/test-server/build/config.js
```

`o` argument is the absolute path where scheme will be saved
`c` argument is the absolute path of compiled config file