import { z } from "@hono/zod-openapi";

export const Error = z.object({
  message: z.string().openapi("Message"),
}).openapi("Error");
