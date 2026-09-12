/**
 * Frees MVP ports before `npm run dev` / `npm start` (Windows EADDRINUSE / stale listeners).
 */
import killPort from "kill-port";

const ports = [8787, 3000];

await Promise.all(
  ports.map(async (port) => {
    try {
      await killPort(port);
      console.log(`Freed port ${port}`);
    } catch {
      // nothing listening — fine
    }
  }),
);
