const mockChannel = {
  assertQueue: jest.fn().mockReturnValue(),
  sendToQueue: jest.fn(),
  assertExchange: jest.fn().mockReturnValue(),
  publish: jest.fn(),
  close: jest.fn().mockReturnValue(),
};

const mockConnection = {
  createChannel: jest.fn().mockReturnValue(mockChannel),
  close: jest.fn().mockReturnValue(),
};

// Mock amqplib directly in the test file
jest.mock("amqplib", () => {
  return {
    connect: jest.fn().mockReturnValue(mockConnection),
  };
});
const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

describe("POST /user", () => {
  it("should create a new user, send to RabbitMQ, and return the user", async () => {
    const userData = { name: "John Doe", email: "john@example.com" };
  
    const amqplibMock = require("amqplib");
    const response = await request(app).post("/user").send(userData);
  
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(userData.name);
    expect(response.body.email).toBe(userData.email);
  
  
  // Check if `connect` was called
  expect(amqplibMock.connect).toHaveBeenCalled();
  // Check if `createChannel` was called
  expect(amqplibMock.connect().createChannel).toBeCalled();
  // Check if `sendToQueue` was called
  expect(amqplibMock.connect().createChannel().sendToQueue).toBeCalled();

  });
  

  // TODO: Add more test cases, for example: handling errors, connection issues with RabbitMQ, etc.
});
