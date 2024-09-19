This is a lightweight project which enables a developer to quickly set up a local blockchain node & provides a UI for working with that blockchain.

This project was initially conceived to work with Solana, but the idea is that it can be used with minimal change for any blockchain that has a local node Docker image defined, or creatable.

The project consists of a minimal Docker file which specifies an image, port exposing, and start-up command, as well as a NestJS server which exposes a Swagger UI for carrying out actions like creating wallets & sending transactions.

The backend server leverages NestJS & Prisma ORM to a SQLite database, so no database configuration is required.

To initialize the project:
chmod +x init.sh

init.sh

Now create at least one model in prisma/schema.prisma.
https://www.prisma.io/docs/orm/prisma-schema/data-model/models

For solana-helper, add this model:

model Account {

  publicKey String @id

  secretKey String

  label String?

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt()
  
}

Whenever you make changes to your schema, run:
npx prisma generate
npx prisma db push

To start the server, run:
npm run start:dev

To visit the Swagger API/UI, navigate to:
http://localhost:3031/api

You can now directly interact with the public API.

To make changes to the public API:
Update src/app.controller.ts
Update src/blockchain-client/blockchain-client.service.ts

There is a specific data db-handler directory at src/db-handlers.
Follow the example there for additional requirements.

ABOUT NESTJS
NestJS follows the principles of modular architecture and takes special care with regard to dependency injection.

When you need a new service, look into using the Nest CLI.
Install NestJS globally or use `npx nest --help`

At a high-level view:
modules have four properties:
- imports: other modules
- controllers: controller classes, decorated with `@Controller()`
- providers: service classes, decorated with `@Injectable()`
- exports: subsect of providers which the module exports


modules have providers, which are service classes.
These service classes inject dependencies in the constructor (e.g. blockchain-client.service.ts)
A service class's dependencies must be either listed in the parent module's `providers`, or must be exported by a module which is imported in the parent module's `imports`.

As a concrete example:
The `DbHandlersModule` defined in `db-handlers.module.ts` lists the providers `PrismaService` and `AccountDbHandlerService`.

`PrismaService` is not exported, which means that it is only available in the local module scope. It is used by the other providers, which are written as `*DbHandlerService`. `PrismaService` is an injected dependency into `AccountDbHandlerService`.

`DbHandlersModule` exports `*DbHandlerService`.

`BlockchainClientModule` (blockchain-client.module.ts) imports `DbHandlersModule`, which means all of `DbHandlersModule`'s exports are available to `BlockchainClientModule`'s providers.

*** SWAGGER Specification ***
NestJS makes creating a Swagger specification very easy.
In `app.controller.ts`, each method has a route decorator, like `@Post('<route>')` or `@Get('<route>')`.

A decorator in the method parameters like `@Body()` or `@Query()` can specify a defined type (actually, a concrete class).

`class-validator` decorators may be used to both validate incoming requests AND to generate Swagger documentation.