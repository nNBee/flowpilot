TEST_DATABASE_URL := postgresql://postgres:postgres@127.0.0.1:54322/postgres
export TEST_DATABASE_URL

.PHONY: dev-api dev-web test-db-start test-db-reset test-db-migrate test-db-stop test-integration-prepare test-integration
dev-api:
	pnpm --filter @flowpilot/api dev

dev-web:
	pnpm --filter @flowpilot/web dev

test-db-start:
	pnpm supabase db start

test-db-reset:
	pnpm supabase db reset --local --no-seed

test-db-migrate:
	pnpm --filter @flowpilot/db db:test:migrate

test-db-stop:
	pnpm supabase stop

test-integration-prepare:
	$(MAKE) test-db-start
	$(MAKE) test-db-reset
	$(MAKE) test-db-migrate

test-integration: test-integration-prepare
	pnpm --filter @flowpilot/db build
	pnpm --filter @flowpilot/api test:integration