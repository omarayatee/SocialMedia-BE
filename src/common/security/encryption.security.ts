import crypto from "node:crypto";
import { ENCRYPTION_KEY, IV_LENGTH } from "../../config";

export const encryptionSecurity = async (plainText: string): Promise<string> => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipherIv = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let cipherText = cipherIv.update(plainText, "utf-8", "hex");
  cipherText += cipherIv.final("hex");
  return `${iv.toString("hex")}::${cipherText}`;
};

export const decryptionSecurity = async (cipherText: string): Promise<string> => {
  let [iv, encryptedData] = cipherText.split("::");
  if (!iv || !encryptedData) {
    throw new Error("Invalid encrypted data");
  }
  const ivBuffer = Buffer.from(iv as string, "hex");
  const decipherIv = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, ivBuffer);
  let plainText = decipherIv.update(encryptedData, "hex", "utf-8");
  plainText += decipherIv.final("utf-8");
  return plainText;
};