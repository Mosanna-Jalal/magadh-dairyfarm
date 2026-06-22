import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameHindi: { type: String, default: "" },
    slug: { type: String, required: true, unique: true },
    unit: { type: String, required: true, default: "kg" }, // litre | kg
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }, // currently available quantity
    lowStockAt: { type: Number, default: 2 },
    sortOrder: { type: Number, default: 99 }, // milk first, then paneer, ghee, khowa, dahi
    emoji: { type: String, default: "🥛" },
    description: { type: String, default: "" },
    // show on the public website homepage (owner can track items privately)
    showOnSite: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
