const express = require('express');
const amqp = require('amqplib');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// MongoDB Setup with Mongoose
const url = 'mongodb://mongodb:27017/mydatabase';
const amqpURL = "amqp://guest:guest@rabbitmq"; // RabbitMQ server URL

// Mongoose Order Schema and Model
const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  items: [String]
});

const Order = mongoose.model('Order', orderSchema);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    initializeRabbitMQ();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

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
          console.log(
            " [x] Received '%s'",
            user
          );
          // Create an order for this user
        const order = new Order({ userId: user._id, items: ['item1', 'item2'] });
        try {
          await order.save();
        } catch (error) {
          console.error('Error inserting order:', error);
        }
        }
      },
      { noAck: true }
    );
}

// Create an Order manually
app.post('/order', async (req, res) => {
  const order = new Order({ userId: req.body.userId, items: req.body.items });
  try {
    const savedOrder = await order.save();
    res.send(savedOrder);
  } catch (error) {
    console.error('Error inserting order:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start server
app.listen(3001);
