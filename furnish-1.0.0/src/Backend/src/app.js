const express = require('express');
const app = express();
const cors = require('cors');

// Import routes
const productRoutes = require('./routes/products');
app.use(cors());

// Middleware for parsing JSON (standard setup)
app.use(express.json());

// Mount the product routes to the '/api/products' endpoint
app.use('/api/products', productRoutes);

module.exports = app; 