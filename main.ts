import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { NOT_FOUND, OK } from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

// OpenAPI models
const ISBN = z.string().min(3).openapi({
  example: "9789027439642",
}).openapi("ISBN");

type Book = z.infer<typeof Book>;
const Book = z.object({
  isbn: ISBN,
  title: z.string().openapi({
    example: "The Man in the Mist",
  }),
}).openapi("Book");

const NotFound = z.object({
  message: z.string().openapi("Message"),
}).openapi("NotFound");

// Init Deno KV
const kv = await Deno.openKv();

await kv.set(["books", "foo"], { isbn: "foo", title: "Foo" } satisfies Book);
await kv.set(["books", "bar"], { isbn: "bar", title: "Bar" } satisfies Book);

// Hono app
const app = new OpenAPIHono();

app
  .doc("/openapi", {
    openapi: "3.0.0",
    info: { title: "My app", version: "1.0" },
  })
  .get("/", (c) => c.redirect("/swagger-ui"))
  .get("/swagger-ui", swaggerUI({ url: "/openapi" }));

// GET /api/books
const getBooksRoute = createRoute(
  {
    method: "get",
    path: "/api/books",
    responses: {
      [OK]: jsonContent(z.array(Book), "All books"),
    },
  },
);

app.openapi(getBooksRoute, async (c) => {
  const iter = kv.list({ prefix: ["books"] });
  const books: Book[] = [];

  for await (const res of iter) books.push(Book.parse(res.value));

  return c.json(books);
});

// POST /api/books
const addBooksRoute = createRoute({
  method: "post",
  path: "/api/books",
  request: {
    body: jsonContent(Book, "The book to add"),
  },
  responses: {
    [OK]: jsonContent(Book, "The created book"),
    [NOT_FOUND]: jsonContent(NotFound, "Not Found"),
  },
});

app.openapi(addBooksRoute, async (c) => {
  const body = c.req.valid("json");
  const result = await kv.set(["books", body.isbn], body);

  return result ? c.json(body, 200) : c.json({ message: "Not found" }, 404);
});

// POST /api/books/:isbn
const getBookRoute = createRoute({
  method: "get",
  path: "/api/books/:isbn",
  request: {
    params: z.object({
      "isbn": ISBN,
    }),
  },
  responses: {
    [OK]: jsonContent(Book, "The created book"),
    [NOT_FOUND]: jsonContent(NotFound, "Not Found"),
  },
});

app.openapi(getBookRoute, async (c) => {
  const { isbn } = c.req.valid("param");
  const result = await kv.get(["books", isbn]);
  return result.value
    ? c.json(Book.parse(result.value), 200)
    : c.json({ message: "Not found" }, 404);
});

// Delete a book by title
// DELETE /api/books/:isbn
const deleteBookRoute = createRoute({
  method: "delete",
  path: "/api/books/:isbn",
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

app.openapi(deleteBookRoute, async (c) => {
  const { isbn } = c.req.valid("param");
  await kv.delete(["books", isbn]);
  return c.text("Deleted!");
});

Deno.serve(app.fetch);
