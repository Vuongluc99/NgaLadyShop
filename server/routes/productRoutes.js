Diff
Copy
Insert
New
// productRoutes.js
const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getFeaturedProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const { Product } = require('../models'); // Giả sử Product là model của bạn

// GET /search?term=searchTerm
router.get('/search', async (req, res) => {
  const searchTerm = req.query.term;
  
  try {
    const products = await Product.findAll({
      where: {
        name: {
          [Op.like]: `%${searchTerm}%`
        }
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;