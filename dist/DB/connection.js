"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const bootstrapDB = async (app, port) => {
    try {
        await mongoose_1.default.connect(config_1.DB_URI, { serverSelectionTimeoutMS: 30000 });
        console.log("DB Connection 🎉");
        app.listen(port, () => console.log(`App listen on port ${port}!`));
    }
    catch (error) {
        console.error("Fail to connect on DB ❌", error);
        process.exit(1);
    }
};
exports.bootstrapDB = bootstrapDB;
