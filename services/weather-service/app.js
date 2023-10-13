// service-a.js
const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
const port = process.env.PORT || 3000;
const kafkaBroker = process.env.KAFKA_BROKER||'localhost:9092';
const kafka = new Kafka({
  clientId: 'weather-service',
  brokers: [kafkaBroker], // Update with your Kafka broker
});

const producer = kafka.producer();

app.get('/update-weather/:city/:temperature', async (req, res) => {
  const city = req.params.city;
  const temperature = req.params.temperature;

  try {
    await producer.connect();
    await producer.send({
      topic: 'weather-updates',
      messages: [{ value: JSON.stringify({ city, temperature }) }],
    });
    await producer.disconnect();
    res.json({ status: 'Weather update sent to Kafka' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send weather update to Kafka' });
  }
});

app.listen(port, () => {
  console.log(`Service A (Weather Service) is running on port ${port}`);
});
