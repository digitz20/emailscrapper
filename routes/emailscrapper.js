const express = require('express');
const router = express.Router();
const { scrapeEmails } = require('../emailscraper');
router.post('/', async (req, res) => {
  const { websites } = req.body;

  if (!websites || !Array.isArray(websites)) {
    return res.status(400).send('Invalid request body. Please provide an array of websites.');
  }

  const results =  [];
  for (const website of websites) {
    const result = await scrapeEmails(website);
    results.push(result);
  }

  res.json(results);
});

router.get('/', (req, res) => {
  res.status(404).send('This endpoint is not available for GET requests. Please use POST to scrape emails.');
});

module.exports =  router;