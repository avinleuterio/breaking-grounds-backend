// [SECTION] Dependencies and Modules
const express = require("express");
const userController = require("../controllers/user");
const auth = require("../auth");

// Destructure the verify and verifyAdmin from auth
const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router = express.Router();

// [SECTION] Routes

	// Route for user registration
	router.post("/register", (req, res) => {
		userController.registerUser(req.body).then(resultFromController => res.send(resultFromController));
	});

	// Route for user authentication
	router.post("/login", userController.loginUser);

	// Route for retrieving user details
	router.get("/details", verify, userController.getProfile);

	// Route for changing user to an admin
	router.post('/update-user', verify, verifyAdmin, userController.updateUserAsAdmin);

	// Route for updating user information
	router.post('/update', verify, userController.updateUser);

	// Route for updating user password
	router.put('/update-password', verify, userController.updatePassword);

	// Route for updating Order Status (Admin Only)
	router.post('/update-order-status', verify, verifyAdmin, userController.updateOrderStatus);


// [SECTION] Export Route System
module.exports = router;