// express
import express from 'express';
import bodyParser from 'body-parser';
import pino from 'pino';

// environment
const port = process.env.PORT || 8000;

// server
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});