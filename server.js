const express = require('express');
const cors = require('cors')

const app = express();
const port = 5677;

app.use(cors())

app.use(express.json());
app.use(express.text());

const emailScrapperRoutes = require('./routes/emailscrapper');

app.use('/emailscrapper', emailScrapperRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});