import "dotenv/config";
import mongoose from "mongoose";
import Portfolio from "./models/Portfolio.js";

async function test() {
  console.log("CONNECTING TO:", process.env.MONGO_URL);
  await mongoose.connect(process.env.MONGO_URL);
  const docs = await Portfolio.find({}).limit(5);
  console.log("SAMPLE PORTFOLIO ENTRIES:");
  console.log(JSON.stringify(docs, null, 2));
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
