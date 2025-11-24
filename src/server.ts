import { serve } from "@hono/node-server";
import app from "./index";

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

console.log(`Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
