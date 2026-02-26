const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const identifyRoute = require('./routes/identify');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Routes
app.use('/identify', identifyRoute);

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: "Bitespeed Identity Reconciliation API is running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
