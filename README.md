# FlowPilot

> 🚧 **Work in Progress** — FlowPilot is an actively developed personal full-stack project. The repository reflects the current state of development and is not production-ready.

FlowPilot is a project I am building to deepen my full-stack development experience, with a current focus on backend engineering, relational data modeling, authentication, authorization, multi-tenancy, and testing.

The project is developed incrementally, with an emphasis on solving concrete problems with simple, maintainable solutions rather than introducing architectural complexity prematurely.

## Tech Stack

### Backend

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Drizzle ORM
- Zod
- Supabase Auth
- Vitest

### Frontend

The frontend is planned to use React and TypeScript but has not been implemented yet.

### Tooling

- pnpm workspaces
- TypeScript strict mode
- Drizzle migrations
- Automated testing with Vitest

## Architecture

FlowPilot is structured as a TypeScript monorepo following a modular monolith approach.

The current engineering focus includes:

- separation between HTTP handling and business logic;
- relational data modeling with database-level constraints;
- multi-tenant data isolation;
- authentication and permission-based authorization;
- shared and validated API contracts;
- transactional operations where consistency matters;
- automated testing of important application behavior.

Additional infrastructure and abstractions are introduced only when there is a concrete need for them.

## Project Structure

```text
flowpilot/
├── apps/
│   ├── api/          # Fastify backend
│   ├── web/          # Frontend – not implemented yet
│   └── worker/       # Background worker – not implemented yet
├── packages/
│   ├── db/           # Database schema and migrations
│   ├── schemas/      # Shared validation schemas
│   └── shared/       # Shared code
└── ...
```

## Current Status

The project is under active development, with the backend currently being the primary focus.

Core backend foundations around authentication, authorization, tenant isolation, database modeling, API structure, and automated testing are being implemented and refined.

The frontend and background worker are planned but have not been implemented yet.

## Why I'm Building It

My professional background is primarily in frontend development with React and TypeScript.

I started FlowPilot to expand that experience into backend and full-stack engineering by designing and implementing the server-side parts of an application myself, including API design, relational data modeling, authentication and authorization, transactional workflows, and automated testing.

The goal is to develop a deeper understanding of the complete application flow, from the API boundary through business logic to the database.
