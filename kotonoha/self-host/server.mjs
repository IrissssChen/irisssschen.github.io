import { createServer } from "node:http";
import { Readable } from "node:stream";
import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, relative as relativePath, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const environment = globalThis.process?.env || {};
const builtWorkerPath = join(root, "dist", "server", "index.js");
const workerPath = existsSync(builtWorkerPath) ? builtWorkerPath : join(root, "worker.js");
const { default: worker } = await import(pathToFileURL(workerPath).href);
const builtStaticPath = join(root, "dist", "client");
const staticRoot = resolve(environment.STATIC_DIR || (existsSync(builtStaticPath) ? builtStaticPath : root));
const databasePath = resolve(environment.DATABASE_PATH || join(root, "data", "kotonoha.sqlite"));
const host = environment.HOST || "127.0.0.1";
const port = Number(environment.PORT || 3000);

mkdirSync(dirname(databasePath), { recursive: true });
const sqlite = new DatabaseSync(databasePath);
sqlite.exec("PRAGMA journal_mode = WAL");
sqlite.exec("PRAGMA foreign_keys = ON");

class D1Statement {
  constructor(database, sql, values = []) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) {
    return new D1Statement(this.database, this.sql, values);
  }

  async first() {
    return this.database.prepare(this.sql).get(...this.values) || null;
  }

  async all() {
    return { results: this.database.prepare(this.sql).all(...this.values) };
  }

  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: result.changes, last_row_id: result.lastInsertRowid } };
  }
}

globalThis.__kotonohaDB = { prepare(sql) { return sqlite.prepare(sql); }, exec(sql) { return sqlite.exec(sql); } };
const DB = {
  prepare(sql) {
    return new D1Statement(sqlite, sql);
  },
  async batch(statements) {
    sqlite.exec("BEGIN IMMEDIATE");
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      sqlite.exec("COMMIT");
      return results;
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  },
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const ASSETS = {
  async fetch(request) {
    const pathname = decodeURIComponent(new URL(request.url).pathname);
    const relative = normalize(pathname.replace(/^[/\\]+/, ""));
    const filePath = resolve(staticRoot, relative || "index.html");
    const outside = relativePath(staticRoot, filePath);
    if (outside.startsWith("..") || resolve(staticRoot, outside) !== filePath) {
      return new Response("Not found", { status: 404 });
    }
    try {
      const stat = statSync(filePath);
      if (!stat.isFile()) return new Response("Not found", { status: 404 });
      return new Response(readFileSync(filePath), {
        headers: { "content-type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream" },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  },
};

function requestUrl(request) {
  const forwardedProtocol = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const protocol = forwardedProtocol === "https" ? "https" : "http";
  const authority = request.headers.host || `${host}:${port}`;
  return `${protocol}://${authority}${request.url || "/"}`;
}

const server = createServer(async (incoming, outgoing) => {
  try {
    const method = incoming.method || "GET";
    const body = method === "GET" || method === "HEAD" ? undefined : Readable.toWeb(incoming);
    const request = new Request(requestUrl(incoming), {
      method,
      headers: incoming.headers,
      body,
      duplex: body ? "half" : undefined,
    });
    const response = await worker.fetch(request, { DB, ASSETS });
    outgoing.statusCode = response.status;
    response.headers.forEach((value, name) => outgoing.setHeader(name, value));
    if (typeof response.headers.getSetCookie === "function") {
      const cookies = response.headers.getSetCookie();
      if (cookies.length) outgoing.setHeader("set-cookie", cookies);
    }
    if (!response.body || method === "HEAD") {
      outgoing.end();
      return;
    }
    Readable.fromWeb(response.body).pipe(outgoing);
  } catch (error) {
    outgoing.statusCode = 500;
    outgoing.setHeader("content-type", "application/json; charset=utf-8");
    outgoing.end(JSON.stringify({ error: error instanceof Error ? error.message : "Server error" }));
  }
});

server.listen(port, host, () => {
  console.log(`Kotonoha is running at http://${host}:${port}`);
  console.log(`Database: ${databasePath}`);
});

export { server, DB };
