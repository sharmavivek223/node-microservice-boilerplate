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
const Inventory=mongoose.model("Inventory")
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

describe("Inventory service tests", () => {
  
  it('should retrieve all inventory items', async () => {
    // Assuming we have inserted an item into the inventory
    const mockInventoryItem = new Inventory({ id: "1", name: "Sample Item" });
    await mockInventoryItem.save();

    const response = await request(app).get('/inventory');

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].id).toBe("1");
    expect(response.body[0].name).toBe("Sample Item");
  });

  it('should retrieve a specific inventory item', async () => {
    const response = await request(app).get('/inventory/1');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe("1");
    expect(response.body.name).toBe("Sample Item");
  });

  it('should return 404 for non-existent inventory item', async () => {
    const response = await request(app).get('/inventory/nonexistent');

    expect(response.status).toBe(404);
  });
});
