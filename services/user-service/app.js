const express = require("express");
const amqp = require("amqplib");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// MongoDB Setup
const url = "mongodb://mongodb:27017/mydatabase";
const amqpURL = "amqp://guest:guest@rabbitmq"; // RabbitMQ server URL
// Mongoose User Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);

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
    await channel.sendToQueue(queueName, Buffer.from(message));
    await channel.assertExchange(queueName, "direct", { durable: true });
    await channel.publish(queueName, "", Buffer.from(message));
    console.log("Sent message to RabbitMQ:", message);
    channel.close();
    connection.close();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to send weather update to rabbitMQ" });
  }
  res.send(savedUser);
});
