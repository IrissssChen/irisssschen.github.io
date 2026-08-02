import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const dist = join(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "server"), { recursive: true });
await mkdir(join(dist, "client"), { recursive: true });
await mkdir(join(dist, ".openai"), { recursive: true });

const css = (await readFile(join(root, "app", "globals.css"), "utf8")).replace('@import "tailwindcss";', "");
await cp(join(root, "static", "index.html"), join(dist, "client", "index.html"));
await cp(join(root, "static", "app.js"), join(dist, "client", "app.js"));
await cp(join(root, "static", "vendor"), join(dist, "client", "vendor"), { recursive: true });
await cp(join(root, "public", "og.png"), join(dist, "client", "og.png"));
await cp(join(root, "public", "favicon.svg"), join(dist, "client", "favicon.svg"));
await writeFile(join(dist, "client", "app.css"), css);
await cp(join(root, ".openai", "hosting.json"), join(dist, ".openai", "hosting.json"));
await cp(join(root, ".openai", "drizzle"), join(dist, ".openai", "drizzle"), { recursive: true });

await cp(join(root, "worker", "index.js"), join(dist, "server", "index.js"));
console.log("Static Sites build completed.");
