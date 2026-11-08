"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptionSecurity = exports.encryptionSecurity = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_1 = require("../../config");
const encryptionSecurity = async (plainText) => {
    const iv = node_crypto_1.default.randomBytes(config_1.IV_LENGTH);
    const cipherIv = node_crypto_1.default.createCipheriv("aes-256-cbc", config_1.ENCRYPTION_KEY, iv);
    let cipherText = cipherIv.update(plainText, "utf-8", "hex");
    cipherText += cipherIv.final("hex");
    return `${iv.toString("hex")}::${cipherText}`;
};
exports.encryptionSecurity = encryptionSecurity;
const decryptionSecurity = async (cipherText) => {
    let [iv, encryptedData] = cipherText.split("::");
    if (!iv || !encryptedData) {
        throw new Error("Invalid encrypted data");
    }
    const ivBuffer = Buffer.from(iv, "hex");
    const decipherIv = node_crypto_1.default.createDecipheriv("aes-256-cbc", config_1.ENCRYPTION_KEY, ivBuffer);
    let plainText = decipherIv.update(encryptedData, "hex", "utf-8");
    plainText += decipherIv.final("utf-8");
    return plainText;
};
exports.decryptionSecurity = decryptionSecurity;
