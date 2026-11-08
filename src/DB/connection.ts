import express from "express";
import mongoose from "mongoose";
import { DB_URI } from "../config";

export const bootstrapDB = async (app: express.Application, port: number) => {
  try {
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 });
    console.log("DB Connection 🎉");
    app.listen(port, () => console.log(`App listen on port ${port}!`));
  } catch (error) {
    console.error("Fail to connect on DB ❌", error);
    process.exit(1);
  }
};