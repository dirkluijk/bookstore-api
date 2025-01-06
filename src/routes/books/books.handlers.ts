import type { RouteHandler } from "@hono/zod-openapi";

import type {
  AddBookRoute,
  DeleteBookRoute,
  GetBookRoute,
  GetBooksRoute,
} from "./books.routes.ts";
import { Book } from "./models/book.ts";

import { kv } from "../../db.ts";

export const getBooks: RouteHandler<GetBooksRoute> = async (c) => {
  const iter = kv.list({ prefix: ["books"] });
  const books: Book[] = [];

  for await (const res of iter) books.push(Book.parse(res.value));

  return c.json(books);
};

export const getBook: RouteHandler<GetBookRoute> = async (c) => {
  const { isbn } = c.req.valid("param");
  const result = await kv.get(["books", isbn]);
  return result.value
    ? c.json(Book.parse(result.value), 200)
    : c.json({ message: "Not found" }, 404);
};

export const addBook: RouteHandler<AddBookRoute> = async (c) => {
  const body = c.req.valid("json");
  const result = await kv.set(["books", body.isbn], body);

  return result ? c.json(body, 200) : c.json({ message: "Not found" }, 404);
};

export const deleteBook: RouteHandler<DeleteBookRoute> = async (c) => {
  const { isbn } = c.req.valid("param");
  await kv.delete(["books", isbn]);
  return c.text("Deleted!");
};
