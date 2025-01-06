import { z } from "@hono/zod-openapi";

export type ISBN = z.infer<typeof ISBN>;
export const ISBN = z.string().min(3).openapi({
  example: "9789027439642",
}).openapi("ISBN");
