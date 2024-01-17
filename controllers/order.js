// [SECTION] Dependencies and Modules
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const auth = require("../auth");

// [SECTION] Adding to Cart
module.exports.addToCart = async (req, res) => {
  const userId = req.user ? req.user.id : null;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const productId = req.body.productId;
  const quantityInOrder = req.body.quantity;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isAdmin) return res.status(403).json({ error: 'Admins cannot create orders.' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    if (quantityInOrder > product.quantityInStock) return res.status(400).json({ error: 'Not enough stock available.' });

    let order = await Order.findOne({ user: userId });
    if (!order) order = new Order({ user: userId, products: [] });

    const existingProductIndex = order.products.findIndex(item => item.product.toString() === productId);
    if (existingProductIndex !== -1) {
      order.products[existingProductIndex].quantity += quantityInOrder;
      order.products[existingProductIndex].totalPrice += product.price * quantityInOrder;
    } else {
      order.products.push({ 
        product: product.toObject(), 
        quantity: quantityInOrder, 
        totalPrice: product.price * quantityInOrder 
      });
    }

    await order.save();
    user.orders = user.orders || [];
    user.orders.push(order._id);
    await user.save();

    product.orders = product.orders || [];
    product.orders.push(order._id);
    product.quantityInStock -= quantityInOrder;
    await product.save();

    res.json({ success: true, message: 'Product added to cart successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




// [SECTION] Retrieving all USER orders
module.exports.getAllMyOrders = async (req, res) => {
  try {
    auth.verify(req, res, async () => {
      const userId = req.user.id;
      const orders = await Order.find({ user: userId }).populate({
        path: 'products',
        populate: {
          path: 'product',
          model: 'Product',
        },
      });

      const formattedOrders = orders.map((order) => ({
        _id: order._id,
        status: order.status,
        createdAt: order.createdAt,
        products: order.products.map((productItem) => ({
          productId: productItem.product._id,
          name: productItem.product.name,
          description: productItem.product.description,
          price: productItem.product.price,
          quantity: productItem.quantity,
          imageUrl: productItem.product.imageUrl,
          totalPrice: productItem.totalPrice // Include total price in the response
        })),
      }));

      console.log('Retrieved all orders successfully!');
      return res.send(formattedOrders);
    });
  } catch (error) {
    console.error('Error retrieving orders:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// [SECTION] Retrieving all ADMIN orders
module.exports.getAllOrders = async (req, res) => {
  try {
    // Use the verify middleware to authenticate and verify admin status
    auth.verify(req, res, async () => {
      // Use the verifyAdmin middleware to ensure the user is an admin
      auth.verifyAdmin(req, res, async () => {
        // Retrieve all orders for all users
        const orders = await Order.find({});

        console.log('Retrieved all orders successfully!');
        return res.send(orders);
      });
    });
  } catch (error) {
    console.error('Error retrieving all orders:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


// [SECTION] Updating order quantity
module.exports.updateOrderQuantity = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  try {
    const user = await User.findById(userId);
    const order = await Order.findOne({ user: userId });

    if (!user || !order) {
      return res.status(404).json({ error: 'User or Order not found.' });
    }

    const productItem = order.products.find(item => item.productId.toString() === productId);

    if (!productItem) {
      return res.status(404).json({ error: 'Product not found in the order.' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (quantity > productItem.quantity) {
      return res.status(400).json({ error: 'Requested quantity exceeds the available quantity in the order.' });
    }

    productItem.quantity -= quantity;
    productItem.totalPrice -= product.price * quantity;

    if (productItem.quantity <= 0) {
      order.products = order.products.filter(item => item.productId.toString() !== productId);
    }

    await Promise.all([order.save(), product.save()]);
    res.send('Order quantity updated successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





// [SECTION] Removing a product from the order
module.exports.removeProductFromOrder = async (req, res) => {
  const userId = req.user.id;
  const productId = req.body.productId;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Find the order for the user
    const order = await Order.findOne({ user: userId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Remove all instances of the product from the order
    order.products = order.products.filter(productItem => !productItem.product.equals(productId));

    // Save the updated order
    await order.save();

    // Update the user's orders array
    user.orders = user.orders.filter(orderId => !orderId.equals(order._id));
    await user.save();

    // Update the product's orders array
    product.orders = product.orders.filter(orderId => !orderId.equals(order._id));
    await product.save();

    console.log('Product removed from order successfully.');
    res.send('Product removed from order successfully.');
  } catch (error) {
    console.error('Error removing product from order:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




// Checkout controller
module.exports.checkoutOrder = async (req, res) => {
  const userId = req.user.id;
  const { name, mobile, email, address } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const order = await Order.findOne({ user: userId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Update order with user's checkout information
    order.name = name;
    order.mobile = mobile;
    order.email = email;
    order.shippingAddress = address;
    order.status = 'Processing';
    await order.save();


    console.log('Order checked out successfully!');
    res.json({ success: true, message: 'Order checked out successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// [SECTION] Adding a product review
module.exports.addProductReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { rating, comment } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Check if the order for the user exists
    const order = await Order.findOne({ user: userId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Check if the order contains the specified product
    if (!order.products.some((orderProductId) => orderProductId.equals(productId))) {
      return res.status(404).json({ error: 'Product not found in the order.' });
    }

    // Check if the order status is 'Completed'
    if (order.status !== 'Completed') {
      return res.status(403).json({ error: 'Cannot add a review for an order that is not completed.' });
    }

    // Check if the user has already reviewed the product
    if (product.reviews.some((review) => review.user.equals(userId))) {
      return res.status(400).json({ error: 'User has already reviewed this product.' });
    }

    // Create a new review
    const newReview = {
      user: userId,
      rating,
      comment,
    };

    // Add the review to the product
    product.reviews.push(newReview);

    // Save the updated product
    await product.save();

    console.log('Product review added successfully!');
    res.send('Product review added successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// [SECTION] Retrieving all USER checked-out items (status: "Processing")
module.exports.getMyCheckedOutItems = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Using the $in operator to filter by multiple statuses
    const checkedOutOrders = await Order.find(
      { 
        user: userId,
        status: { $in: ['Processing', 'Completed', 'Cancelled'] }
      }
    ).populate({
      path: 'products',
      populate: {
        path: 'product',
        model: 'Product',
      },
    });

    const formattedOrders = checkedOutOrders.map((order) => ({
      _id: order._id,
      status: order.status,
      createdAt: order.createdAt,
      products: order.products.map((productItem) => ({
        productId: productItem.product._id,
        name: productItem.product.name,
        description: productItem.product.description,
        price: productItem.product.price,
        quantity: productItem.quantity,
        imageUrl: productItem.product.imageUrl,
        totalPrice: productItem.totalPrice // Include total price in the response
      })),
    }));

    console.log('Retrieved checked-out items successfully!');
    return res.send(formattedOrders);
  } catch (error) {
    console.error('Error retrieving checked-out items:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


