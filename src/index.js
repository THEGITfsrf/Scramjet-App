import { createServer } from "node:http";
import { fileURLToPath } from "url";
import { hostname } from "node:os";
import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyBasicAuth from "@fastify/basic-auth";
import dotenv from "dotenv";
import rateLimit from "@fastify/rate-limit";
import fastifyCors from "@fastify/cors";

dotenv.config();

import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const publicPath = fileURLToPath(new URL("../public/", import.meta.url));

logging.set_level(logging.NONE);
Object.assign(wisp.options, {
  allow_udp_streams: false,
  hostname_blacklist: [/example\.com/],
  dns_servers: ["1.1.1.3", "1.0.0.3"],
});

const fastify = Fastify({
  serverFactory: (handler) => {
    return createServer()
      .on("request", (req, res) => {
        // COEP + COOP headers for SharedArrayBuffer / worker safety
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        handler(req, res);
      })
      .on("upgrade", (req, socket, head) => {
        if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
        else socket.end();
      });
  },
});

// Rate limiting
await fastify.register(rateLimit, {
  max: 30,
  timeWindow: "1 minute",
  ban: 5,
  errorResponseBuilder: () => ({
    statusCode: 429,
    error: "Too Many Requests",
    message: "Slow down.",
  }),
});

// CORS: allow only PythonAnywhere origin
await fastify.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowedHost = /\.?pythonanywhere\.com$/i;
    if (!origin || allowedHost.test(new URL(origin).hostname)) cb(null, true);
    else cb(null, false);
  },
  credentials: true,
});

// Basic Auth
await fastify.register(fastifyBasicAuth, {
  validate(username, password, req, reply, done) {
    const USER = process.env.PROXY_USER;
    const PASS = process.env.PROXY_PASS;
    if (username === USER && password === PASS) done();
    else done(new Error("Unauthorized"));
  },
  authenticate: true,
});
fastify.addHook("onRequest", fastify.basicAuth);

const basePrefix = "/uidfhsuid";

// Helper to set headers for service worker files
function SWHeaders(res) {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // SW scripts must be cross-origin
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
}

// Helper to set headers for same-origin static files (workers, modules)
function SameOriginHeaders(res) {
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
}

// Public files (including SW scripts)
fastify.register(fastifyStatic, {
  root: publicPath,
  decorateReply: true,
  prefix: `${basePrefix}/`,
  setHeaders: SWHeaders,
});

// Scramjet JS
fastify.register(fastifyStatic, {
  root: scramjetPath,
  prefix: `/scram/`,
  decorateReply: false,
  setHeaders: SameOriginHeaders,
});

// Libcurl JS
fastify.register(fastifyStatic, {
  root: libcurlPath,
  prefix: `/libcurl/`,
  decorateReply: false,
  setHeaders: SameOriginHeaders,
});

// Baremux JS + workers
fastify.register(fastifyStatic, {
  root: baremuxPath,
  prefix: `/baremux/`,
  decorateReply: false,
  setHeaders: (res, path) => {
    // Only worker.js needs same-origin policy
    if (path.endsWith("worker.js")) {
      res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    } else {
      res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    }
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  },
});


// 404 handler
fastify.setNotFoundHandler((res, reply) => {
  return reply.code(404).type("text/html").sendFile("404.html");
});

// Listening logs
fastify.server.on("listening", () => {
  const address = fastify.server.address();
  console.log("Listening on:");
  console.log(`\thttp://localhost:${address.port}`);
  console.log(`\thttp://${hostname()}:${address.port}`);
  console.log(
    `\thttp://${address.family === "IPv6" ? `[${address.address}]` : address.address}:${address.port}`
  );
});

// Shutdown handling
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
function shutdown() {
  console.log("SIGTERM signal received: closing HTTP server");
  fastify.close();
  process.exit(0);
}

// Listen
let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;
fastify.listen({ port, host: "0.0.0.0" });
