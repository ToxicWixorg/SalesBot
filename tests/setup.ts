// Sets required environment variables for tests.
// ??= ensures real values take precedence if already set.
process.env.BOT_TOKEN ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
