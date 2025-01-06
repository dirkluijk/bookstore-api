import type { Book } from "./routes/books/models/book.ts";

export const kv = await Deno.openKv();

await kv.set(["books", "foo"], { isbn: "foo", title: "Foo" } satisfies Book);
await kv.set(["books", "bar"], { isbn: "bar", title: "Bar" } satisfies Book);
