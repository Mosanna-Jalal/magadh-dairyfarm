import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["notice", "offer"], default: "notice", index: true },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    active: { type: Boolean, default: true },
    expiresAt: { type: String, default: "" }, // "YYYY-MM-DD"; empty = no expiry
  },
  { timestamps: true }
);

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
