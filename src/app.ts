import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import books from "./routes/books/books.index.ts";

const app: OpenAPIHono = new OpenAPIHono();

app
  .route("/", books)
  .doc("/openapi", {
    openapi: "3.0.0",
    info: { title: "My app", version: "1.0" },
  })
  .get("/", (c) => c.redirect("/swagger-ui"))
  .get("/swagger-ui", swaggerUI({ url: "/openapi" }));

export default app;
