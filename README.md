# Awesome Node.js backend starter

> [!NOTE]  
> The template will be updated over the time

## Description

`awesome-backend-starter` provides a powerful starter template for Node.js backend services.

It comes with:

- [fastify](https://fastify.dev/);
- Modular structure;
- Dependency injection (via [awilix](https://github.com/jeffijoe/awilix));
- Powerful error-handling capabilities using Rust-inspired result container.

## Getting started

1. Template is working with Node.js 22 and larger. First of all make sure that your Node.js version is capatible with requirements.

2. Install dependencies. We use `pnpm` as package manager, but you can change it to one you more familiar with:

```sh
pnpm i
# npm i
# yarn i
```

3. Copy `.env.example` to new `.env`. You can do it by simply running following script:

```sh
node --run copy:config
```

4. Launch the db:

```sh
# Using docker cli
docker compose up db -d

# Using provided npm script
node --run db:start:dev
```

5. Generate and apply migration:

```sh
# Generate migration
node --run db:generate-migration

# Apply
node --run db:apply-migration
```

6. Run the application:

```sh
node --run start:dev

# For running in watch mode
node --run start:dev:watch
```

### Working with migrations

1. Edit an existing schema or create new.
2. Run following command to generate migration:

```sh
node --run db:generate-migration
```

3. In order to apply the migration run:

```sh
node --run db:apply-migration
```

4. If you want to drop a migration, just run this command:

```sh
node --run db:drop-migration
```

## Stay in touch

Author - [Kyrylo Savieliev](https://github.com/OneLiL05)

## License

`awesome-backend-starter` is [MIT licensed](https://github.com/OneLiL05/awesome-backend-starter/blob/main/LICENSE)
