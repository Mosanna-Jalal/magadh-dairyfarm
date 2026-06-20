// DANGER: clears records for a fresh start.
// Safety: will NOT run unless you pass --confirm, and it ALWAYS writes a full
// JSON backup to ./backups/ before deleting anything.
// Run: npm run reset -- --confirm
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const envFile = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const MONGODB_URI = /MONGODB_URI=(.+)/.exec(envFile)?.[1]?.trim();
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const confirmed = process.argv.includes("--confirm") || process.env.RESET_CONFIRM === "YES";

const Product = mongoose.model("Product", new mongoose.Schema({}, { strict: false, timestamps: true }));
const Customer = mongoose.model("Customer", new mongoose.Schema({}, { strict: false, timestamps: true }));
const Purchase = mongoose.model("Purchase", new mongoose.Schema({}, { strict: false, timestamps: true }));
const Payment = mongoose.model("Payment", new mongoose.Schema({}, { strict: false, timestamps: true }));

// Default catalogue — milk first, then paneer, ghee, khowa, dahi. Stock starts at 0.
const PRODUCTS = [
  { name: "Milk", nameHindi: "दूध", slug: "milk", unit: "kg", price: 60, stock: 0, lowStockAt: 15, sortOrder: 1, emoji: "🥛", description: "Fresh whole milk from our cows and buffaloes, morning and evening — no water, no powder." },
  { name: "Paneer", nameHindi: "पनीर", slug: "paneer", unit: "kg", price: 350, stock: 0, lowStockAt: 2, sortOrder: 2, emoji: "🧀", description: "Soft paneer made fresh at the farm — for everyday cooking and special occasions." },
  { name: "Ghee", nameHindi: "घी", slug: "ghee", unit: "kg", price: 750, stock: 0, lowStockAt: 1, sortOrder: 3, emoji: "🧈", description: "Traditional bilona ghee, slow-made from pure cream with a rich aroma." },
  { name: "Khowa", nameHindi: "खोवा", slug: "khowa", unit: "kg", price: 420, stock: 0, lowStockAt: 1, sortOrder: 4, emoji: "🥮", description: "Sweet-shop quality khowa for laddu, peda and gujhiya." },
  { name: "Dahi", nameHindi: "दही", slug: "dahi", unit: "kg", price: 90, stock: 0, lowStockAt: 2, sortOrder: 5, emoji: "🥣", description: "Thick-set curd with the authentic earthen-pot taste." },
];

async function main() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });

  const [customers, products, purchases, payments] = await Promise.all([
    Customer.find().lean(),
    Product.find().lean(),
    Purchase.find().lean(),
    Payment.find().lean(),
  ]);
  const counts = {
    customers: customers.length,
    products: products.length,
    purchases: purchases.length,
    payments: payments.length,
  };
  console.log("Current records:", counts);

  // ALWAYS save a safety backup first — even if we end up aborting.
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const backupsDir = path.join(__dirname, "..", "backups");
  fs.mkdirSync(backupsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupsDir, `pre-reset-${stamp}.json`);
  fs.writeFileSync(
    backupPath,
    JSON.stringify({ savedAt: new Date().toISOString(), counts, customers, products, purchases, payments }, null, 2)
  );
  console.log("Safety backup written to:", backupPath);

  if (!confirmed) {
    console.log("\n⛔ Aborted — no data was deleted.");
    console.log("   This wipes ALL customers, purchases and payments. If you are sure, run:");
    console.log("   npm run reset -- --confirm");
    await mongoose.disconnect();
    return;
  }

  console.log("\nClearing all records…");
  await Promise.all([Customer.deleteMany({}), Purchase.deleteMany({}), Payment.deleteMany({})]);
  console.log("Resetting product catalogue (stock 0)…");
  await Product.deleteMany({});
  await Product.insertMany(PRODUCTS);

  console.log("\n✅ Fresh start ready (a backup of the cleared data is in /backups).");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("Reset failed:", e.message);
  process.exit(1);
});
