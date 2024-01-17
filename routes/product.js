// [SECTION] Dependencies and Modules
const express = require("express");
const productController = require("../controllers/product");
const auth = require("../auth");

// Destructure the verify and verifyAdmin from auth
const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router = express.Router();

// [SECTION] Routes

	// Route for adding new product
	router.post('/add-product', verify, verifyAdmin, productController.addProduct);
	
	// Route for retrieving all products
	router.get('/all', productController.getAllProducts);

	// Route for retrieving a SPECIFIC course
	router.get("/:productId", productController.getProduct);

	// Route for retrieving products by category
	router.get('/category/:category', productController.getProductsByCategory);

	// Route for retrieving all ACTIVE products
	router.get('/', productController.getAllActive);

	// Route to search for product by product name
	router.post("/search", productController.searchProductByName);

	// Route for updating a product (Admin)
	router.put("/:productId", verify, verifyAdmin, productController.updateProduct);

	// Route for archiving a product (Admin)
	router.put("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);
	
	// Route for activating a product (Admin)
	router.put("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

// [SECTION] Export Route System
module.exports = router;