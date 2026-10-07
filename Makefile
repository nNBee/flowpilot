.PHONY: test-db-start test-db-reset test-db-migrate test-db-stop test-integration-prepare test-integration

test-db-start:
	pnpm supabase db start

test-db-reset:
	pnpm supabase db reset --local --no-seed

test-db-migrate:
	pnpm --filter @flowpilot/db db:test:migrate

test-db-stop:
	pnpm supabase stop

test-integration-prepare: test-db-start test-db-reset test-db-migrate

test-integration: test-integration-prepare
	pnpm --filter @flowpilot/db build
	pnpm --filter @flowpilot/api test:integration