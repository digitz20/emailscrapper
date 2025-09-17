const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

const maxPagesPerWebsite = 10;
const requestDelay = 1000; // 1 second

const scrapeEmails = async (website) => {
    console.log(`Scraping ${website}`);
    const emails = new Set();
    const queue = [website];
    const visited = new Set();
    let pagesCrawled = 0;
    const websiteHostname = new url.URL(website).hostname;

    while (queue.length > 0 && pagesCrawled < maxPagesPerWebsite) {
        const currentUrl = queue.shift();

        if (visited.has(currentUrl)) {
            continue;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, requestDelay + Math.random() * 2000));
            const response = await axios.get(currentUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const html = response.data;
            const $ = cheerio.load(html);

            console.log(`Crawling ${currentUrl} (${pagesCrawled}/${maxPagesPerWebsite})`);

            visited.add(currentUrl);
            pagesCrawled++;

            // Extract emails from text
            const bodyText = $('body').text();
            bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)?.forEach(email => emails.add(email));

            // Extract emails from mailto links
            $('a[href^="mailto:"]').each((i, el) => {
                const mailto = $(el).attr('href');
                const email = mailto.replace('mailto:', '').split('?')[0];
                emails.add(email);
            });

            // Find internal links and add them to the queue
            $('a').each((i, el) => {
                const link = $(el).attr('href');
                if (link) {
                    const absoluteUrl = new url.URL(link, website).href;
                    if (new url.URL(absoluteUrl).hostname === websiteHostname && !visited.has(absoluteUrl)) {
                        if (absoluteUrl.includes('contact')) {
                            queue.unshift(absoluteUrl); // Prioritize contact links
                        } else {
                            queue.push(absoluteUrl);
                        }
                    }
                }
            });

        } catch (error) {
            console.error(`Failed to load ${currentUrl}: ${error.message}`);
        }
    }

    return { website, emails: Array.from(emails) };
};

const processWebsites = async (websites) => {
    const results = [];
    for (const website of websites) {
        const result = await scrapeEmails(website);
        results.push(result);
    }
    return results;
};

module.exports = { scrapeEmails, processWebsites };