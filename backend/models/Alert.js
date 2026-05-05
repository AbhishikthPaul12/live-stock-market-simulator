import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    symbol: {
      type: String,
      required: true
    },

    targetPrice: {
      type: Number,
      required: true
    },

    type: {
      type: String,
      enum: ["ABOVE", "BELOW"],
      required: true
    },

    triggered: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Alert", alertSchema);