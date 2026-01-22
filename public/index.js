"use strict";

const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const tabsEl = document.getElementById("tabs");

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

let tabs = [];
let activeTab = null;

async function ensureTransport() {
	const wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";

	if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
		await connection.setTransport("/libcurl/index.mjs", [
			{ websocket: wispUrl },
		]);
	}
}

function createTab(url = "about:blank") {
	const frame = scramjet.createFrame();
	frame.frame.classList.add("active");

	const tab = {
		frame,
		history: [],
		index: -1,
	};

	document.body.appendChild(frame.frame);
	tabs.push(tab);

	const tabEl = document.createElement("div");
	tabEl.className = "tab";
	tabEl.textContent = "New Tab";
	tabEl.onclick = () => activateTab(tab);
	tab.tabEl = tabEl;

	tabsEl.appendChild(tabEl);
	activateTab(tab);

	if (url !== "about:blank") navigate(tab, url);
}

function activateTab(tab) {
	tabs.forEach(t => {
		t.frame.frame.classList.remove("active");
		t.tabEl.classList.remove("active");
	});

	activeTab = tab;
	tab.frame.frame.classList.add("active");
	tab.tabEl.classList.add("active");

	const current = tab.history[tab.index];
	if (current) address.value = current;
}

function navigate(tab, url) {
	tab.history = tab.history.slice(0, tab.index + 1);
	tab.history.push(url);
	tab.index++;

	tab.frame.go(url);
	tab.tabEl.textContent = new URL(url).hostname || "New Tab";
	address.value = url;
}

form.addEventListener("submit", async e => {
	e.preventDefault();
	await registerSW();
	await ensureTransport();

	const url = search(address.value, document.getElementById("sj-search-engine").value);
	navigate(activeTab, url);
});

document.getElementById("back").onclick = () => {
	if (activeTab.index > 0) {
		activeTab.index--;
		activeTab.frame.go(activeTab.history[activeTab.index]);
		address.value = activeTab.history[activeTab.index];
	}
};

document.getElementById("forward").onclick = () => {
	if (activeTab.index < activeTab.history.length - 1) {
		activeTab.index++;
		activeTab.frame.go(activeTab.history[activeTab.index]);
		address.value = activeTab.history[activeTab.index];
	}
};

document.getElementById("new-tab").onclick = () => createTab();

document.getElementById("theme").onclick = () => {
	document.body.dataset.theme =
		document.body.dataset.theme === "light" ? "dark" : "light";
};

// boot
createTab("https://example.com");
