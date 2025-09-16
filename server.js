const express = require('express');
const app = express();
const port = 6789;

app.use(express.json());

const emailScrapperRoutes = require('./routes/emailscrapper');

app.use('/emailscrapper', emailScrapperRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});