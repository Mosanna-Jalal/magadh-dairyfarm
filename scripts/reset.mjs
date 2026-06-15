// Clear all records for a fresh client handover.
// Removes every customer, purchase and payment, and resets the product
// catalogue to the 5 default products with stock 0 (client sets real stock).
// Run: npm run reset
import fs from "node:fs";
import mongoose from "mongoose";

const envFile = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const MONGODB_URI = /MONGODB_URI=(.+)/.exec(envFile)?.[1]?.trim();
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const Product = mongoose.model("Product", new mongoose.Schema({}, { strict: false, timestamps: true }));
const Customer = mongoose.model("Customer", new mongoose.Schema({}, { strict: false, timestamps: true }));
const Purchase = mongoose.model("Purchase", new mongoose.Schema({}, { strict: false, timestamps: true }));
const Payment = mongoose.model("Payment", new mongoose.Schema({}, { strict: false, timestamps: true }));

// Default catalogue — milk first, then paneer, ghee, khowa, dahi. Stock starts at 0.
const PRODUCTS = [
  { name: "Milk", nameHindi: "दूध", slug: "milk", unit: "litre", price: 60, stock: 0, lowStockAt: 15, sortOrder: 1, emoji: "🥛", description: "Fresh whole milk from our cows and buffaloes, morning and evening — no water, no powder." },
  { name: "Paneer", nameHindi: "पनीर", slug: "paneer", unit: "kg", price: 350, stock: 0, lowStockAt: 2, sortOrder: 2, emoji: "🧀", description: "Soft paneer made fresh at the farm — for everyday cooking and special occasions." },
  { name: "Ghee", nameHindi: "घी", slug: "ghee", unit: "kg", price: 750, stock: 0, lowStockAt: 1, sortOrder: 3, emoji: "🧈", description: "Traditional bilona ghee, slow-made from pure cream with a rich aroma." },
  { name: "Khowa", nameHindi: "खोवा", slug: "khowa", unit: "kg", price: 420, stock: 0, lowStockAt: 1, sortOrder: 4, emoji: "🥮", description: "Sweet-shop quality khowa for laddu, peda and gujhiya." },
  { name: "Dahi", nameHindi: "दही", slug: "dahi", unit: "kg", price: 90, stock: 0, lowStockAt: 2, sortOrder: 5, emoji: "🥣", description: "Thick-set curd with the authentic earthen-pot taste." },
];

async function main() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });

  const before = {
    customers: await Customer.countDocuments(),
    purchases: await Purchase.countDocuments(),
    payments: await Payment.countDocuments(),
  };
  console.log("Current records:", before);

  console.log("Clearing all records…");
  await Promise.all([Customer.deleteMany({}), Purchase.deleteMany({}), Payment.deleteMany({})]);

  console.log("Resetting product catalogue (stock 0)…");
  await Product.deleteMany({});
  await Product.insertMany(PRODUCTS);

  console.log("\n✅ Fresh start ready.");
  console.log("   Customers: 0 | Purchases: 0 | Payments: 0");
  console.log("   Products: " + PRODUCTS.map((p) => p.name).join(", ") + " (all stock 0)");
  console.log("\n   The client can now add customers and set today's stock from the admin panel.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("Reset failed:", e.message);
  process.exit(1);
});
