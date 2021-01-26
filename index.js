const http = require('http');
const apps = require('./apps.json');

const port = 8080;
const errorMessage = 'Please only make POST requests to the /apps API endpoint with optional valid JSON';
const defaultRange = {
	by: "id",
	startId: apps[0].id,
	endId: apps[apps.length - 1].id,
	startName: apps[0].name,
	endName: apps[apps.length - 1].name,
	max: 50,
	order: "asc"
};

http.createServer(function (request, response) {
	const { pathname } = new URL(request.url, `http://${request.headers.host}`);

	if (request.method !== 'POST') {
		// Only acccept POST requests
		response.end(errorMessage);
	} else if (pathname !== "/apps") {
		// The API only has a single endpoint: /apps
		response.end(errorMessage);
	} else {
		let body = "";
		request.on('data', (chunk) => {
			body += chunk;
		});
		request.on('end', () => {
			if (body) {
				try {
					body = JSON.parse(body);
				} catch {
					console.error("Request provided invalid JSON. Using default JSON instead");
					body = "";
				}
			}

			// Send paginated apps response
			if (typeof body !== "object" || !body.range) {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify(getPaginatedApps(apps)));
			} else {
				if (!body.range.by) {
					response.end('Missing required valid "by" value in "range" query param');
				} else {
					response.writeHead(200, { 'Content-Type': 'application/json' });
					response.end(JSON.stringify(getPaginatedApps(apps, body.range)));
				}
			}

		});
	}
}).listen(process.env.PORT || port, () => {
	console.log(`Server running on port ${port}`);
});

/** Returns a subset of consecutive objects from data according to range */
const getPaginatedApps = (data, range) => {

	// Select user-defined or default range parameters
	const byValue = range?.by || defaultRange.by;
	const startValue = range?.start || (byValue === "id" ? defaultRange.startId : defaultRange.startName);
	const endValue = range?.end || (byValue === "id" ? defaultRange.endId : defaultRange.endName);
	const maxValue = range?.max || defaultRange.max;
	const orderValue = range?.order || defaultRange.order;

	// Find the slice indices
	const startIndex = data.findIndex(({ id, name }) => (byValue === "id" ? id : name) === startValue);
	let endIndex = data.findIndex(({ id, name }) => (byValue === "id" ? id : name) === endValue);
	endIndex = maxValue <= endIndex - startIndex ? startIndex + maxValue : endIndex + 1;

	// Slice (paginate) the data
	const slicedData = data.slice(startIndex, endIndex);

	// Return slice data ordered appropriately
	return orderValue === "asc" ? slicedData : slicedData.reverse();
};