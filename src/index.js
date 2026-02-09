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

// Wisp Configuration: Refer to the documentation at https://www.npmjs.com/package/@mercuryworkshop/wisp-js

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
await fastify.register(rateLimit, {
    max: 30,                 // 5 requests...
    timeWindow: "1 minute", // ...per minute per IP
    ban: 5,                // optional: ban IP after 10 violations
    allowList: [],          // you can add your own IP here to bypass limits
    errorResponseBuilder: function (req, context) {
        return {
            statusCode: 429,
            error: "Too Many Requests",
            message: "Slow down."
        };
    }
});
await fastify.register(fastifyCors, {
  origin: (origin, cb) => {
    // Allow only your target site and subdomains
    // Example: allow example.com and *.example.com
    const allowedHost = /\.?pythonanywhere\.com$/i; // regex: optional subdomain + example.com

    if (!origin || allowedHost.test(new URL(origin).hostname)) {
      cb(null, true); // allow CORS
    } else {
      cb(null, false); // block CORS
    }
  },
  credentials: true, // if you need cookies / auth headers
});


await fastify.register(fastifyBasicAuth, {
    validate(username, password, req, reply, done) {
        const USER = process.env.PROXY_USER;
        const PASS = process.env.PROXY_PASS;

        if (username === USER && password === PASS) {
            done();
        } else {
            done(new Error("Unauthorized"));
        }
    },
    authenticate: true
});

fastify.addHook("onRequest", fastify.basicAuth);


fastify.addHook("onRequest", fastify.basicAuth);
const basePrefix = "/uidfhsuid";

// Public files
fastify.register(fastifyStatic, {
    root: publicPath,
    decorateReply: true,
    prefix: `${basePrefix}/`,  // <- Add this
});

// Scramjet
fastify.register(fastifyStatic, {
    root: scramjetPath,
    prefix: `/scram/`,
    decorateReply: false,
});

// Libcurl
fastify.register(fastifyStatic, {
    root: libcurlPath,
    prefix: `/libcurl/`,
    decorateReply: false,
});

// Baremux
fastify.register(fastifyStatic, {
    root: baremuxPath,
    prefix: `/baremux/`,
    decorateReply: false,
});

fastify.setNotFoundHandler((res, reply) => {
	return reply.code(404).type("text/html").sendFile("404.html");
});

fastify.server.on("listening", () => {
	const address = fastify.server.address();

	// by default we are listening on 0.0.0.0 (every interface)
	// we just need to list a few
	console.log("Listening on:");
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(
		`\thttp://${
			address.family === "IPv6" ? `[${address.address}]` : address.address
		}:${address.port}`
	);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
	console.log("SIGTERM signal received: closing HTTP server");
	fastify.close();
	process.exit(0);
}

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

fastify.listen({
	port: port,
	host: "0.0.0.0",
});
