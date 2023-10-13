const express = require("express");
const amqp = require("amqplib");

const app = express();
const port = process.env.PORT || 4000;
const amqpURL = "amqp://guest:guest@rabbitmq"; // RabbitMQ server URL

async function consumeWeatherUpdates() {
  try {
    const connection = await amqp.connect(amqpURL);
    const channel = await connection.createChannel();

    const queueName = "weather-updates";
    process.once("SIGINT", async () => {
      console.log("closed connection");
      await channel.close();
      await connection.close();
    });
    await channel.assertQueue(queueName, { durable: false });

    await channel.consume(
      queueName,
      (message) => {
        if (message) {
          console.log(
            " [x] Received '%s'",
            JSON.parse(message.content.toString())
          );
        }
      },
      { noAck: true }
    );
  } catch (err) {
    console.error(err);
  }
}

consumeWeatherUpdates();

app.listen(port, () => {
  console.log(`Service B (Weather Dashboard) is running on port ${port}`);
});
