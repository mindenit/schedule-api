# Mindenit Schedule API

Mindenit Schedule API is a drop-in replacement for NURE CIST API, that a list of features such as:

- **100% Valid JSON**, no more pain with fixing NURE CIST's JSON;
- **Better performance**, get data with 2x performance boost;
- **Revolutionary response format**, you don't need to make requests to additional routes to get particular information, everything you need could be get in one request;
- **Awesome REST endpoints**, no more headaches while trying to understand CIST endpoints;
- **Documentation for developers written with care**, everything you need to know about API endpoints is in one place, with playground for testing.

## Getting started

Documentation with playground for testing could be found via [link](https://sh.mindenit.org/api/)

## Development

1. Application is working with Node.js 22 and larger. First of all make sure that your Node.js version is capatible with requirements.

2. Install dependencies. We use `pnpm` as package manager

```sh
pnpm i
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
