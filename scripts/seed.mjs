// Seed Magadh Dairy Farm with demo data.
// Run: npm run seed
import fs from "node:fs";
import mongoose from "mongoose";

const envFile = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const MONGODB_URI = /MONGODB_URI=(.+)/.exec(envFile)?.[1]?.trim();
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

// deterministic PRNG so reruns produce the same demo data
let seedState = 20260612;
function rand() {
  seedState |= 0;
  seedState = (seedState + 0x6d2b79f5) | 0;
  let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

function dayStr(d = new Date()) {
  return new Date(d).toLocaleDateString("en-CA");
}
function addDays(day, n) {
  const d = new Date(day + "T12:00:00");
  d.setDate(d.getDate() + n);
  return dayStr(d);
}

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({}, { strict: false, timestamps: true })
);
const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({}, { strict: false, timestamps: true })
);
const Purchase = mongoose.model(
  "Purchase",
  new mongoose.Schema({}, { strict: false, timestamps: true })
);
const Payment = mongoose.model(
  "Payment",
  new mongoose.Schema({}, { strict: false, timestamps: true })
);

const PRODUCTS = [
  { name: "Milk", nameHindi: "दूध", slug: "milk", unit: "kg", price: 60, stock: 62, lowStockAt: 15, sortOrder: 1, emoji: "🥛", description: "Fresh whole milk from our cows and buffaloes, morning and evening — no water, no powder." },
  { name: "Paneer", nameHindi: "पनीर", slug: "paneer", unit: "kg", price: 350, stock: 8, lowStockAt: 2, sortOrder: 2, emoji: "🧀", description: "Soft paneer made fresh at the farm — for everyday cooking and special occasions." },
  { name: "Ghee", nameHindi: "घी", slug: "ghee", unit: "kg", price: 750, stock: 5.5, lowStockAt: 1, sortOrder: 3, emoji: "🧈", description: "Traditional bilona ghee, slow-made from pure cream with a rich aroma." },
  { name: "Khowa", nameHindi: "खोवा", slug: "khowa", unit: "kg", price: 420, stock: 0, lowStockAt: 1, sortOrder: 4, emoji: "🥮", description: "Sweet-shop quality khowa for laddu, peda and gujhiya." },
  { name: "Dahi", nameHindi: "दही", slug: "dahi", unit: "kg", price: 90, stock: 1.5, lowStockAt: 2, sortOrder: 5, emoji: "🥣", description: "Thick-set curd with the authentic earthen-pot taste." },
];

const CUSTOMERS = [
  { name: "Ramesh Yadav", phone: "9876543210", address: "Ward 4, Tekari Bazar", openingBalance: 240, milkQty: 2 },
  { name: "Sunita Devi", phone: "9123456780", address: "Mauri Gaon", openingBalance: 0, milkQty: 1 },
  { name: "Mohammad Imran", phone: "9988776655", address: "Masjid Road, Tekari", openingBalance: 560, milkQty: 3 },
  { name: "Anil Kumar", phone: "9876501234", address: "Station Road", openingBalance: 120, milkQty: 1.5 },
  { name: "Priya Sharma", phone: "9090909090", address: "Shastri Nagar", openingBalance: 0, milkQty: 1 },
  { name: "Rajesh Singh", phone: "8877665544", address: "Gaya Road", openingBalance: 800, milkQty: 2.5 },
  { name: "Kavita Kumari", phone: "7766554433", address: "Ward 7, Tekari", openingBalance: 60, milkQty: 0.5 },
  { name: "Suresh Prasad", phone: "9012345678", address: "Naya Tola", openingBalance: 350, milkQty: 2 },
  { name: "Geeta Devi", phone: "8800112233", address: "Purani Bazar", openingBalance: 0, milkQty: 1 },
  { name: "Dinesh Mahto", phone: "7700998877", address: "Khet Tola", openingBalance: 150, milkQty: 1.5 },
];

const DAYS_BACK = 15; // seed entries for the last 16 days incl. today

async function main() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected. Clearing old data…");
  await Promise.all([
    Product.deleteMany({}),
    Customer.deleteMany({}),
    Purchase.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  const products = await Product.insertMany(PRODUCTS);
  const byName = Object.fromEntries(products.map((p) => [p.name, p]));
  const customers = await Customer.insertMany(
    CUSTOMERS.map(({ milkQty, ...c }) => ({ ...c, active: true, note: "" }))
  );
  console.log(`Inserted ${products.length} products, ${customers.length} customers.`);

  const today = dayStr();
  const purchases = [];
  const payments = [];

  customers.forEach((cust, ci) => {
    const profile = CUSTOMERS[ci];
    let runningDue = profile.openingBalance;

    for (let back = DAYS_BACK; back >= 0; back--) {
      const date = addDays(today, -back);
      const items = [];

      // milk almost every day — that's the main business
      if (rand() < 0.92) {
        const m = byName["Milk"];
        const qty = profile.milkQty;
        items.push({ productId: m._id, name: m.name, unit: m.unit, qty, rate: m.price, amount: qty * m.price });
      }
      // dahi sometimes
      if (rand() < 0.16) {
        const d = byName["Dahi"];
        const qty = pick([0.5, 1]);
        items.push({ productId: d._id, name: d.name, unit: d.unit, qty, rate: d.price, amount: qty * d.price });
      }
      // paneer once in a while
      if (rand() < 0.11) {
        const p = byName["Paneer"];
        const qty = pick([0.25, 0.5]);
        items.push({ productId: p._id, name: p.name, unit: p.unit, qty, rate: p.price, amount: qty * p.price });
      }
      // ghee rarely
      if (rand() < 0.06) {
        const g = byName["Ghee"];
        const qty = pick([0.25, 0.5]);
        items.push({ productId: g._id, name: g.name, unit: g.unit, qty, rate: g.price, amount: qty * g.price });
      }
      // khowa on special occasions
      if (rand() < 0.04) {
        const k = byName["Khowa"];
        const qty = 0.5;
        items.push({ productId: k._id, name: k.name, unit: k.unit, qty, rate: k.price, amount: qty * k.price });
      }

      if (items.length === 0) continue;
      const total = Math.round(items.reduce((s, i) => s + i.amount, 0) * 100) / 100;
      runningDue += total;
      purchases.push({
        customerId: cust._id,
        date,
        items,
        total,
        note: rand() < 0.06 ? pick(["evening delivery", "guests at home", "early morning pickup"]) : "",
      });

      // every so often the customer settles part of the khata
      const payChance = back === 0 ? 0.3 : 0.13;
      if (runningDue > 150 && rand() < payChance) {
        const frac = 0.4 + rand() * 0.55;
        let amount = Math.round((runningDue * frac) / 50) * 50;
        amount = Math.max(50, Math.min(amount, Math.floor(runningDue)));
        runningDue -= amount;
        payments.push({
          customerId: cust._id,
          date,
          amount,
          mode: rand() < 0.45 ? "upi" : "cash",
          note: "",
        });
      }
    }

    // a couple of customers keep a clean slate — pay off everything today
    if (["Priya Sharma", "Geeta Devi"].includes(profile.name) && runningDue > 0) {
      payments.push({ customerId: cust._id, date: today, amount: Math.round(runningDue * 100) / 100, mode: "upi", note: "full settlement" });
    }
  });

  await Purchase.insertMany(purchases);
  await Payment.insertMany(payments);
  console.log(`Inserted ${purchases.length} purchases, ${payments.length} payments.`);

  // final dues report
  console.log("\n— Khata summary —");
  for (const cust of customers) {
    const bought = purchases.filter((p) => p.customerId === cust._id).reduce((s, p) => s + p.total, 0);
    const paid = payments.filter((p) => p.customerId === cust._id).reduce((s, p) => s + p.amount, 0);
    const due = (cust.openingBalance || 0) + bought - paid;
    console.log(
      `  ${cust.name.padEnd(18)} bought ₹${bought.toFixed(0).padStart(6)}  paid ₹${paid
        .toFixed(0)
        .padStart(6)}  due ₹${due.toFixed(0).padStart(6)}`
    );
  }
  console.log("\nStock: " + PRODUCTS.map((p) => `${p.name} ${p.stock}${p.unit === "litre" ? "L" : "kg"}`).join(", "));
  await mongoose.disconnect();
  console.log("\n✅ Seed complete.");
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
