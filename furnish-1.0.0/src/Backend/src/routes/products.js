const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Map the GET request to the controller function
// The actual path will be defined in app.js (e.g., '/api/products')
router.get('/', productController.getProducts);

module.exports = router;