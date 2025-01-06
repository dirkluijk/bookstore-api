import { OpenAPIHono } from "@hono/zod-openapi";
import * as handlers from "./books.handlers.ts";
import * as routes from "./books.routes.ts";

const router = new OpenAPIHono()
  .openapi(routes.getBooks, handlers.getBooks)
  .openapi(routes.getBook, handlers.getBook)
  .openapi(routes.addBook, handlers.addBook)
  .openapi(routes.deleteBook, handlers.deleteBook);

export default router;
