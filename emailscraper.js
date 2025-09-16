
const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

const maxPagesPerWebsite = 10;
const requestDelay = 1000; // 1 second

const scrapeEmails = async (website) => {
    const emails = new Set();
    const queue = [website];
    const visited = new Set(); // Use a local visited set for each website
    let pagesCrawled = 0;
    const websiteHostname = new url.URL(website).hostname;

    while (queue.length > 0 && pagesCrawled < maxPagesPerWebsite) {
        const currentUrl = queue.shift();

        if (visited.has(currentUrl)) {
            continue;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, requestDelay));
            const { data } = await axios.get(currentUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            visited.add(currentUrl);
            pagesCrawled++;

            const $ = cheerio.load(data);

            // Extract emails from text and mailto links
            $('body').text().match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)?.forEach(email => emails.add(email));
            $('a[href^="mailto:"]').each((i, el) => {
                const email = $(el).attr('href').replace('mailto:', '');
                emails.add(email);
            });

            // Collect internal links
            $('a').each((i, el) => {
                const link = $(el).attr('href');
                if (link) {
                    const absoluteUrl = new url.URL(link, website).href;
                    const absoluteUrlHostname = new url.URL(absoluteUrl).hostname;
                    if (absoluteUrlHostname === websiteHostname && !visited.has(absoluteUrl)) {
                        queue.push(absoluteUrl);
                    }
                }
            });

        } catch (error) {
            console.error(`Failed to load ${currentUrl}: ${error.message}`);
        }
    }

    return { website, emails: Array.from(emails) };
};

module.exports = { scrapeEmails };