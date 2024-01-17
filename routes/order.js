// [SECTION] Dependencies and Modules
const express = require('express');
const orderController = require('../controllers/order');
const auth = require('../auth');

// Destructure the verify and verifyAdmin from auth
const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router = express.Router();

// [SECTION] Routes

    // Route for adding a product to the user's cart
    router.post('/add-to-cart', verify, orderController.addToCart);

    // Route for USER retrieving all orders
    router.get('/cart', verify, orderController.getAllMyOrders);

    // Route for ADMIN retrieving all orders
    router.get('/all', verify, verifyAdmin, orderController.getAllOrders);

    // Route for updating an order
    router.post('/update-order', verify, orderController.updateOrderQuantity);
    
    // Route for removing an order
    router.post('/remove-order', verify, orderController.removeProductFromOrder);

    // Route for checking out orders
    router.post('/checkout', verify, orderController.checkoutOrder);

    // Route for adding a review to a product
    router.post('/add-review/:productId', verify, orderController.addProductReview);

    // Route for USER retrieving all checked-out items
    router.get('/checked-out-items', verify, orderController.getMyCheckedOutItems);


// [SECTION] Export Route System
module.exports = router;
