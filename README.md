# WorKing API

[![CI](https://github.com/workinghq/working-api/actions/workflows/ci.yml/badge.svg)](https://github.com/workinghq/working-api/actions/workflows/ci.yml)
[![CodeQL](https://github.com/workinghq/working-api/actions/workflows/codeql.yml/badge.svg)](https://github.com/workinghq/working-api/actions/workflows/codeql.yml)
[![Image in GHCR](https://github.com/workinghq/working-api/actions/workflows/publish-ghcr.yml/badge.svg)](https://github.com/workinghq/working-api/actions/workflows/publish-ghcr.yml)

## Description

WorKing API is the backend service for the WorKing platform, an integrated collaboration and project management solution designed to help teams organize workflows, manage projects, and communicate efficiently.

## Technologies

- [Node.js](https://nodejs.org/)
- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)

## Running the project

### Requirements

- Node.js >= 26
- npm
- git
- PostgreSQL database

### 1. Configure the environment variables

Create a `.env` file in the project root and configure the environment variables listed in `.env.example`.

### 2. Install dependencies

```bash
npm install
```

### 3. Run prisma migrations and generate client

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run the project

```bash
# for development mode
npm run start:dev

# for production mode
npm run build
npm run start:prod
```

## Docker

Before starting the containers, configure the PostgreSQL environment variables in your `.env` file according to the variables defined in `docker-compose.yml`.

Example:

```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
```

### Start the containers:

```bash
docker compose up -d
```

### Stoping the containers

```bash
# Add the -v flag if you also want to remove the volumes
docker compose down
```

## Running tests

### Unit tests

```bash
npm test
```

### E2E tests

Create a .env.test file with the same variables as .env.example, configured for the test environment.

```bash
npm run test:e2e
```
