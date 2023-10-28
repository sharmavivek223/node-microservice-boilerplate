const express = require('express');
const httpProxy = require('http-proxy');
require("dotenv").config();

const app = express();
const PORT = 4000;
const proxy = httpProxy.createProxyServer();

const routes = {
    'user': `http://${process.env.NODE_ENV=='development'?'localhost':'user-service'}:3000`,
    'order': `http://${process.env.NODE_ENV=='development'?'localhost':'order-service'}:3001`,
    'inventory': `http://${process.env.NODE_ENV=='development'?'localhost':'inventory-service'}:3002`
};

// Middleware to forward requests
app.all('*', (req, res) => {
    const targetServiceUrl = routes[req.path.split('/')[1]];
    if (!targetServiceUrl) {
        return res.status(404).send('Not found');
    }

    proxy.web(req, res, {
        target: targetServiceUrl,
        changeOrigin: true
    });
});

proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Service error');
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
