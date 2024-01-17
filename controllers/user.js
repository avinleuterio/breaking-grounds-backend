// [SECTION] Dependencies and Modules
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require('../models/Order');
const bcrypt = require("bcrypt");
const auth = require("../auth");

// [SECTION] User Registration
module.exports.registerUser = async (reqBody) => {
  try {
    // Check if the username or email already exists
    const existingUser = await User.findOne({
    $or: [{ username: reqBody.username }, { email: reqBody.email }]
  });

  // If username or email already exists, return an error
  if (existingUser) {
    console.log('Username or email already exists.');
    return { success: false, message: 'Username or email already exists.' };
  }

  // Creates a new user object named "newUser" using the mongoose model "User"
  let newUser = new User({
    username: reqBody.username,
    password: bcrypt.hashSync(reqBody.password, 10),
    firstName: reqBody.firstName,
    lastName: reqBody.lastName,
    email: reqBody.email,
    mobileNo: reqBody.mobileNo,
    address: reqBody.address
  });

  // Saves the created object to our database
  const user = await newUser.save();

  // User registration is successful
  console.log('User registered successfully!');
  return ('User registered successfully!');
  } catch (error) {
    console.error('Error registering user:', error.message);
    return { success: false, message: 'Error registering user.' };
  }
};

//  [SECTION] User Login/Authentication
module.exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      console.log('User does not exist.');
      return res.status(404).json({ error: "User does not exist." });
  }

  const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);

  if (isPasswordCorrect) {
    const accessToken = auth.createAccessToken(user);
    console.log('User logged in successfully!');
    return res.json({ accessToken });
  } else {
    console.log('Incorrect password.');
    return res.status(401).json({ error: "Your email and password do not match. Please try again." });
  }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// [SECTION] Retrieve User Information
module.exports.getProfile = async (req, res) => {
  try {
  // Retrieve user details by ID, excluding the password field
    const user = await User.findById(req.user.id).select('-password');

  // Check if the user is not found
  if (!user) {
    console.log('User not found.');
    return res.status(404).send({ success: false, message: 'User not found.' });
  }

  // User details retrieved successfully
  console.log('User details retrieved successfully!');
  return res.send(user);
  } catch (error) {
    console.error('Error retrieving user details:', error.message);
    return res.status(500).send({ success: false, error: 'Internal Server Error' });
  }
};

// [SECTION] Changing user to an admin
module.exports.updateUserAsAdmin = async (req, res) => {
  const { userId } = req.body;

  try {
  // Find the user by ID
    const user = await User.findByIdAndUpdate(userId);

    if (!user) {
      console.log('User not found.');
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update user to admin
    user.isAdmin = true;

    // Save the updated user
    await user.save();

    console.log('User updated to admin successfully!');
    res.send('User updated to admin successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// [SECTION] Update user information
module.exports.updateUser = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find the user by ID
    const user = await User.findByIdAndUpdate(userId);

  if (!user) {
    console.log('User not found.');
    return res.status(404).json({ error: 'User not found.' });
  }

  
  // Update user information based on the request body
  const { username, firstName, lastName, email, mobileNo, address } = req.body;

  if (username) user.username = username;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (mobileNo) user.mobileNo = mobileNo;
  if (address) user.address = address;

  // Save the updated user information
  await user.save();

  console.log('User information updated successfully!');
  res.json({ message: 'User information updated successfully!', user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// [SECTION] Update user password
module.exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.user; // Extracting user ID from the authorization header
  
    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });
  
    // Sending a success response
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
  };

// [SECTION] Update Order Status (Admin Only)
module.exports.updateOrderStatus = async (req, res) => {
  const adminId = req.user.id; // Assuming the request is made by an admin
  const { orderId, newStatus } = req.body;

  try {
    // Check if the user is an admin
    const adminUser = await User.findById(adminId);
    if (!adminUser || !adminUser.isAdmin) {
      console.log('User is not an admin.');
      return res.status(403).json({ error: 'Only admins can update order status.' });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      console.log('Order not found.');
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Update order status
    order.status = newStatus || 'Processing'; // Assuming 'Processing' as the default status

    // Save the updated order
    await order.save();

    console.log('Order status updated successfully!');
    res.send('Order status updated successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};