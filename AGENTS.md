# FlowPilot – Codex Instructions

## Working principles

- Build FlowPilot as a real product first, not as a technology showcase.
- Prefer simple, production-sensible solutions over clever abstractions.
- Keep changes focused and incremental.
- Do not introduce infrastructure, libraries, abstractions, or patterns without a concrete product need.
- If a change appears beneficial, explain the trade-off before changing direction.

## Architecture rules

- FlowPilot is a modular monolith unless a real need emerges to split it.
- Multi-tenancy and tenant isolation are foundational security concerns.
- Core business entities should remain strongly typed and relational.
- Keep frontend, API, and worker responsibilities clear.
- Supabase is infrastructure; core business logic belongs in the Fastify application.

## Avoid by default

Do not introduce these without a concrete justified need:

- microservices
- GraphQL
- Kafka
- Kubernetes
- CQRS
- event sourcing
- Elasticsearch
- unnecessary Redis
- custom authentication
- custom object storage
- AI features added only for novelty

## Code quality

- Prefer explicit, readable code over excessive abstraction.
- Keep business logic out of route handlers where practical.
- Preserve strong typing across frontend, API, database, and shared schemas.
- Validate external input at system boundaries.
- Treat tenant isolation as a testable invariant.
- Avoid premature generic frameworks inside the product.

## Testing

Once tooling exists:

- run relevant typechecks
- run relevant linting
- run focused tests for changed behavior
- add tests for important business rules
- add tests for tenant-isolation boundaries

Do not over-test implementation details.
