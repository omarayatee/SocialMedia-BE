import bcrypt from "bcrypt";

export const hash = async (plainText: string, salt: number = 12, minor: "a" | "b" = "b"): Promise<string> => {
  const saltRound = await bcrypt.genSalt(salt, minor);
  return await bcrypt.hash(plainText, saltRound);
};

export const compare = async (plainText: string, cipherText: string): Promise<boolean> => {
  return await bcrypt.compare(plainText, cipherText);
};