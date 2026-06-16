import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    unit: String,
    qty: Number,
    rate: Number,
    amount: Number,
  },
  { _id: false }
);

const PurchaseSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    date: { type: String, required: true, index: true }, // "YYYY-MM-DD"
    shift: { type: String, enum: ["morning", "night"], default: "morning", index: true },
    items: [ItemSchema],
    total: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

PurchaseSchema.index({ customerId: 1, date: 1 });

export default mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
