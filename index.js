// Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");

// Cross Origin Resource Sharing
const cors = require("cors");

// External Route
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");

// Environment Setup
const port = 4007;

// Server setup
const app = express()

// Log the request body before body-parser
app.use((req, res, next) => {
	console.log('Request Body:', req.body);
	next();
  });

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allows our backend application to be available to our frontend application
app.use(cors());

// Database Connection
mongoose.connect("mongodb+srv://vincentroelleuterio:admin123@cluster0.8o9hxiw.mongodb.net/ecommerce?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

mongoose.connection.once('open', () => console.log("Now connected to MongoDB Atlas"))

// [SECTION] Backend Routes
app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/order", orderRoutes);

// Server Gateway Response
if(require.main === module){
	app.listen(port, () => {
		console.log(`API is now online on port ${port}`);
	})
}

module.exports = {app, mongoose};