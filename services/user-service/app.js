const express = require("express");
const amqp = require("amqplib");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// MongoDB Setup
const url = process.env.MONGO_DB_URL || "mongodb://mongodb:27017/mydatabase";
const amqpURL = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq"; // RabbitMQ server URL
// Mongoose User Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);

// Separated DB connection initialization
const connectToDbAndStartServer = () => {
  mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Connected to MongoDB");

      // Start server only after DB connection is established
      app.listen(3000, () => {
        console.log("Server started on port 3000");
      });
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
      process.exit(1);
    });
};

// Create a User
app.post("/user", async (req, res) => {
  const user = new User({ name: req.body.name, email: req.body.email });

  let savedUser;
  try {
    savedUser = await user.save();
  } catch (error) {
    console.error("Error inserting user into MongoDB:", error);
    return res.status(500).send("Internal Server Error");
  }

  // Publish to RabbitMQ
  try {
    const connection = await amqp.connect(amqpURL);
    const channel = await connection.createChannel();
    const message = JSON.stringify(savedUser);
    const queueName = "user-queue";

    await channel.assertQueue(queueName, { durable: false });
    channel.sendToQueue(queueName, Buffer.from(message));
    await channel.assertExchange(queueName, "direct", { durable: true });
    channel.publish(queueName, "", Buffer.from(message));
    console.log("Sent message to RabbitMQ:", message);
    channel.close();
    connection.close();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to send update to rabbitMQ" });
  }
  res.send(savedUser);
});

// Only connect to the DB and start the server if this script is the main module being run
if (require.main === module) {
  connectToDbAndStartServer();
}

// Export the app for testing
module.exports = app;
