/**
 * Database Configuration
 * 
 * This module handles the connection to MongoDB using Mongoose.
 * It reads the MONGO_URI from environment variables and establishes
 * a connection to the database.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @returns {Promise} MongoDB connection promise
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;