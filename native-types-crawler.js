const Crawler = require("crawler");
const fs = require('fs');
const path = require('path');

function initCrawler(url, handler) {
	return new Promise(resolve => {
		const crawler = new Crawler({
			maxConnections: 1,
			retries: 5,
			rateLimit: 200,
			// This will be called for each crawled page
			callback: function (error, res, done) {
				if (error) {
					console.log(error);
				} else {
					resolve(handler(res));
				}
				done();
			}
		});
		return crawler.queue(url);
	});

}

function crawlTypes(res) {
	var $ = res.$;

	// $ is Cheerio by default
	//a lean implementation of core jQuery designed specifically for the server
	const types = $("main article ul li a").map((id, item) => $(item).text().trim());

	return types.toArray()
}

async function main() {
	const builtinTypes = await initCrawler('https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects', crawlTypes);
	const webApiTypes = await initCrawler('https://developer.mozilla.org/en-US/docs/Web/API', crawlTypes);

    const caseRegexp = /^[a-z]/

    const validBuiltInTypes = builtinTypes.filter(t => !caseRegexp.test(t));
    const validWebApiTypes = webApiTypes.filter(t => !caseRegexp.test(t));

	const outputJson = {
	    builtIn: validBuiltInTypes,
        webApi: validWebApiTypes.concat(validWebApiTypes.map(t => 'Window.' + t)),
    }

	fs.writeFileSync(path.resolve('global-types.json'), JSON.stringify(outputJson, null, 4))

}

main()
