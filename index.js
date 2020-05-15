const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

app.use(bodyParser());
app.use("/assets", express.static("assets"));

app.use("/api", (req, res) => {
	req.headers.host = "discord.com";
	req.headers.origin = "discord.com";
	delete req.headers.referer;

	var { headers, method, body } = req;

	if (method === "GET") {
		body = undefined;
	}

	fetch(`https://discord.com/api${req.path}`, {
		headers,
		method,
		body: JSON.stringify(body),
	})
		.then(async (r) => {
			var headers = r.headers.entries();

			for (var header of headers) {
				if (
					["content-encoding", "Content-Length", "transfer-encoding", "connection"].includes(
						header[0].toLowerCase()
					)
				) {
					continue;
				}
				res.header(header[0], header[1]);
			}

			var text = await r.text();
			res.status(r.status).send(text);
		})
		.catch((r) => {
			console.log(r);
			res.status(500);
		});
});

app.use("*", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.listen(3000, () => {
	console.log("server listening on :3000");
});
