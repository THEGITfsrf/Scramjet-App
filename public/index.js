"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("sj-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("sj-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("sj-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("sj-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("sj-error-code");

const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
	files: {
		wasm: "/scram/scramjet.wasm.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	},
});

scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	const url = search(address.value, searchEngine.value);

	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";
	if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
		await connection.setTransport("/libcurl/index.mjs", [
			{ websocket: wispUrl },
		]);
	}
	// Open a new blank tab
	const win = window.open("about:blank", "_blank");
	
	// Build a minimal HTML shell
	win.document.write(`
	    <!doctype html>
	    <html>
	    <head>
	        <title>Scramjet Proxy</title>
	        <style>
	            html, body {
	                margin: 0;
	                padding: 0;
	                height: 100%;
	                overflow: hidden;
	            }
	            #container {
	                width: 100%;
	                height: 100%;
	            }
	        </style>
	    </head>
	    <body>
	        <div id="container"></div>
	    </body>
	    </html>
	`);
	win.document.close();
	
	// Create Scramjet frame
	const frame = scramjet.createFrame();
	frame.frame.id = "sj-frame";
	
	// Append Scramjet frame into the new tab
	win.document.getElementById("container").appendChild(frame.frame);
	
	// Navigate through Scramjet
	frame.go(url);
});
