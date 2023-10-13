// service-b.js
const { Kafka } = require('kafkajs');
const express = require('express');

const app = express();
const port = process.env.PORT || 4000;
const kafkaBroker = process.env.KAFKA_BROKER||'localhost:9092';

const kafka = new Kafka({
  clientId: 'weather-dashboard',
  brokers: [kafkaBroker], // Update with your Kafka broker
});

const consumer = kafka.consumer({ groupId: 'weather-dashboard-group' });

async function consumeWeatherUpdates() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'weather-updates', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const weatherUpdate = JSON.parse(message.value.toString());
      console.log('Received weather update:', weatherUpdate);
    },
  });
}

consumeWeatherUpdates();

app.listen(port, () => {
  console.log(`Service B (Weather Dashboard) is running on port ${port}`);
});
