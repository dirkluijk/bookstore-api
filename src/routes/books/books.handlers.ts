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
  const list = kv.list({ prefix: ["books"] });
  const books: Book[] = [];

  for await (const result of list) books.push(Book.parse(result.value));

  return c.json(books);
};

export const getBook: RouteHandler<GetBookRoute> = async (c) => {
  const { isbn } = c.req.valid("param");
  const result = await kv.get(["books", isbn]);

  if (result.value === null) {
    return c.json({ message: "Not found" }, 404);
  }

  return c.json(Book.parse(result.value), 200);
};

export const addBook: RouteHandler<AddBookRoute> = async (c) => {
  const body = c.req.valid("json");
  await kv.set(["books", body.isbn], body);

  return c.json(body, 200);
};

export const deleteBook: RouteHandler<DeleteBookRoute> = async (c) => {
  const { isbn } = c.req.valid("param");
  await kv.delete(["books", isbn]);

  return c.text("Deleted!");
};
