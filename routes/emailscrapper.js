const express = require('express');
const router = express.Router();
const { processWebsites } = require('../emailscraper');

router.post('/', async (req, res) => {
    let websites;

    if (req.is('json')) {
        websites = req.body.websites;
    } else if (req.is('text/plain')) {
        websites = req.body.split(/[\s,;\n]+/).map(s => s.trim()).filter(s => s);
    }

    if (!websites || !Array.isArray(websites)) {
        return res.status(400).send('Invalid request body. Please provide an array of websites in JSON format or a newline/comma/space/semicolon-separated list in plain text.');
    }

    const processedWebsites = websites.map(website => {
        if (!/^https?:\/\//i.test(website)) {
            return `https://${website}`;
        }
        return website;
    });

    try {
        const results = await processWebsites(processedWebsites);
        res.json(results);
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send(`Error scraping websites: ${error.message}`);
    }
});

router.get('/', (req, res) => {
    res.status(404).send('This endpoint is not available for GET requests. Please use POST to scrape emails.');
});

module.exports = router;