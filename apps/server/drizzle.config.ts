import { defineConfig } from "drizzle-kit";

/** Default kit target remains SQLite. Postgres schema: ./src/db/schema.pg.ts */
export default defineConfig({
  schema: "./src/db/schema.sqlite.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/game.db",
  },
});
