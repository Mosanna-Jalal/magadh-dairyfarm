import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    date: { type: String, required: true, index: true }, // "YYYY-MM-DD"
    amount: { type: Number, required: true },
    mode: { type: String, default: "cash" }, // cash | upi | other
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
