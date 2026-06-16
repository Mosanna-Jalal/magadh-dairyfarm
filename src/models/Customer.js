import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: "", index: true },
    address: { type: String, default: "" },
    // Which session(s) this customer belongs to — morning, night or both
    shift: { type: String, enum: ["morning", "night", "both"], default: "both" },
    // Old outstanding amount carried over from Faizan's manual register
    openingBalance: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
