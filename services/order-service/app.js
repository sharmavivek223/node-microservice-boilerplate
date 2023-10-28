const express = require("express");
const amqp = require("amqplib");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// MongoDB Setup with Mongoose
const url = process.env.MONGO_DB_URL || "mongodb://mongodb:27017/mydatabase";
const amqpURL = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq"; // RabbitMQ server URL

// Mongoose Order Schema and Model
const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  items: [String],
});

const Order = mongoose.model("Order", orderSchema);

// Separated DB connection initialization
const connectToDbAndStartServer = () => {
  mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Connected to MongoDB");
      initializeRabbitMQ()
      // Start server only after DB connection is established
      app.listen(3001, () => {
        console.log("Server started on port 3001");
      });
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
      process.exit(1);
    });
};

async function initializeRabbitMQ() {
  // Subscribe to RabbitMQ
  const connection = await amqp.connect(amqpURL);
  const channel = await connection.createChannel();

  const queueName = "user-queue";
  process.once("SIGINT", async () => {
    console.log("closed connection");
    await channel.close();
    await connection.close();
  });
  await channel.assertQueue(queueName, { durable: false });

  await channel.consume(
    queueName,
    async (message) => {
      if (message) {
        const user = JSON.parse(message.content.toString());
        console.log(" [x] Received '%s'", user);
        // Create an order for this user
        const order = new Order({
          userId: user._id,
          items: ["item1", "item2"],
        });
        try {
          await order.save();
        } catch (error) {
          console.error("Error inserting order:", error);
        }
      }
    },
    { noAck: true }
  );
}

// Create an Order manually
app.post("/order", async (req, res) => {
  const order = new Order({ userId: req.body.userId, items: req.body.items });
  try {
    const savedOrder = await order.save();
    res.send(savedOrder);
  } catch (error) {
    console.error("Error inserting order:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Only connect to the DB and start the server if this script is the main module being run
if (require.main === module) {
  connectToDbAndStartServer();
}

// Export the app for testing
module.exports = app;
