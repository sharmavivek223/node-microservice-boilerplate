// service-a.js
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const amqp = require('amqplib');

const amqpURL = 'amqp://guest:guest@rabbitmq'; // RabbitMQ server URL


app.get("/update-weather/:city/:temperature", async (req, res) => {
  const city = req.params.city;
  const temperature = req.params.temperature;

  try {
    const connection = await amqp.connect(amqpURL);
    const channel = await connection.createChannel();
    const message=JSON.stringify({ city, temperature });
    const queueName = "weather-updates";

    await channel.assertQueue(queueName, { durable: false });
    await channel.sendToQueue(
      queueName,
      Buffer.from(message)
    );
    await channel.assertExchange(queueName,'direct',{ durable: true})
    await channel.publish(queueName, '', Buffer.from(message));
    console.log("Sent message to RabbitMQ:", message);
    res.json({message})
    channel.close();
    connection.close();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to send weather update to rabbitMQ" });
  }
});

app.listen(port, () => {
  console.log(`Service A (Weather Service) is running on port ${port}`);
});
