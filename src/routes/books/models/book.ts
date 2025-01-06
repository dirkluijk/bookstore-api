import { z } from "@hono/zod-openapi";

import { ISBN } from "./isbn.ts";

export type Book = z.infer<typeof Book>;
export const Book = z.object({
  isbn: ISBN,
  title: z.string().openapi({
    example: "The Man in the Mist",
  }),
}).openapi("Book");
