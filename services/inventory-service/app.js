const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// MongoDB Setup with Mongoose
const url = "mongodb://mongodb:27017/mydatabase";

// Mongoose Inventory Schema and Model
const inventorySchema = new mongoose.Schema({
  id: String,
  // ... any other fields related to inventory items
});

const Inventory = mongoose.model("Inventory", inventorySchema);

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");

    // Start server only after DB connection is established
    app.listen(3002, () => {
      console.log("Server started on port 3002");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// Check Inventory
app.get("/inventory", async (req, res) => {
  try {
    const items = await Inventory.find({});
    res.send(items);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/inventory/:itemId", async (req, res) => {
  try {
    const item = await Inventory.findOne({ id: req.params.itemId });
    if (!item) {
      return res.status(404).send("Item not found");
    }
    res.send(item);
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).send("Internal Server Error");
  }
});
