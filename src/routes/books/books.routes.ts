import { createRoute, z } from "@hono/zod-openapi";
import { NOT_FOUND, OK } from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { Book } from "./models/book.ts";
import { ISBN } from "./models/isbn.ts";
import { Error } from "./models/error.ts";

const tags = ["Books"];

// GET /api/books
export const getBooks = createRoute(
  {
    method: "get",
    path: "/api/books",
    tags,
    responses: {
      [OK]: jsonContent(z.array(Book), "All books"),
    },
  },
);

// GET /api/books/{isbn}
export const getBook = createRoute({
  method: "get",
  path: "/api/books/{isbn}",
  tags,
  request: {
    params: z.object({
      "isbn": ISBN,
    }),
  },
  responses: {
    [OK]: jsonContent(Book, "The created book"),
    [NOT_FOUND]: jsonContent(Error, "Not Found"),
  },
});

// POST /api/books
export const addBook = createRoute({
  method: "post",
  path: "/api/books",
  tags,
  request: {
    body: jsonContent(Book, "The book to add"),
  },
  responses: {
    [OK]: jsonContent(Book, "The created book"),
    [NOT_FOUND]: jsonContent(Error, "Not Found"),
  },
});

// DELETE /api/books/{isbn}
export const deleteBook = createRoute({
  method: "delete",
  path: "/api/books/{isbn}",
  tags,
  request: {
    params: z.object({
      "isbn": ISBN,
    }),
  },
  responses: {
    [OK]: {
      description: "Delete successful",
    },
  },
});

export type GetBooksRoute = typeof getBooks;
export type GetBookRoute = typeof getBook;
export type AddBookRoute = typeof addBook;
export type DeleteBookRoute = typeof deleteBook;
