ALTER TABLE "app_user" ADD COLUMN "email" text;
--> statement-breakpoint
UPDATE "app_user" AS "app_user_to_backfill"
SET "email" = NULLIF(lower(btrim("auth_user"."email")), '')
FROM "auth"."users" AS "auth_user"
WHERE "app_user_to_backfill"."id" = "auth_user"."id";
--> statement-breakpoint
DO $$
DECLARE
	"missing_email_count" bigint;
BEGIN
	SELECT count(*)
	INTO "missing_email_count"
	FROM "app_user"
	WHERE "email" IS NULL;

	IF "missing_email_count" > 0 THEN
		RAISE EXCEPTION
			'Cannot make app_user.email NOT NULL: % app_user row(s) have no matching non-empty auth.users.email',
			"missing_email_count";
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "app_user" ALTER COLUMN "email" SET NOT NULL;
