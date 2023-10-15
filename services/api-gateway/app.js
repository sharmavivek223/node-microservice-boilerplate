const express = require('express');
const httpProxy = require('http-proxy');
const app = express();

const userServiceProxy = httpProxy.createProxyServer({
  target: 'http://localhost:3000',
});

const orderServiceProxy = httpProxy.createProxyServer({
  target: 'http://localhost:3001',
});

const inventoryServiceProxy = httpProxy.createProxyServer({
  target: 'http://localhost:3002',
});

// User routes
app.all('/user/*', (req, res) => {
  userServiceProxy.web(req, res);
});

// Order routes
app.all('/order/*', (req, res) => {
  orderServiceProxy.web(req, res);
});

// Inventory routes
app.all('/inventory/*', (req, res) => {
  inventoryServiceProxy.web(req, res);
});

app.listen(4000);
