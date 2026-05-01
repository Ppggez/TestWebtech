const fs = require('fs/promises');
const path = require('path');

// Path to your local JSON data[cite: 5]
const dataPath = path.join(__dirname, '../data/products.json');

/**
 * Fetches all products from the local JSON file.
 * @returns {Promise<Array>} Array of product objects.
 */
const getAllProducts = async () => {
    try {
        const rawData = await fs.readFile(dataPath, 'utf-8');
        const products = JSON.parse(rawData);
        return products;
    } catch (error) {
        // Throwing the error up to the controller to handle HTTP specifics
        throw new Error('Could not retrieve products data');
    }
};

module.exports = {
    getAllProducts
};