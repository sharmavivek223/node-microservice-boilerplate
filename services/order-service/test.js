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

describe("Order service tests", () => {
  it("should create an order manually", async () => {
    const mockOrder = {
      items: ["item1", "item2"],
    };

    const response = await request(app)
      .post("/order")
      .send(mockOrder);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(mockOrder);
    
    // If you want to validate against the database, you'd query it directly here
    // ... 
  });

  // ... More tests ...
});
