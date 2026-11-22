import { fileTypeFromBuffer } from "file-type";
import multer from "multer";
import { BadRequestException } from "../../exception";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { Request } from "express";
import { StorageEnum } from "../../enum";
import { tmpdir } from "node:os";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  files: ["application/pdf", "application/json"],
};

export const localFileUpload = ({ maxFileSize = 5, storageApproach = StorageEnum.MEMORY }: { maxFileSize?: number; storageApproach?: StorageEnum }) => {
  const storage =
    storageApproach == StorageEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination(req, file, callback) {
            callback(null, tmpdir());
          },
          filename(req, file, callback) {
            callback(null, randomUUID() + file.originalname);
          },
        });
  return multer({ storage, limits: { fileSize: maxFileSize * 1024 * 1024 } });
};

export const processFile = async ({ customPath = "general", file, validation }: { customPath?: string; file: Express.Multer.File; validation: string[] }) => {
  if (file.path) {
    file.buffer = await readFile(file.path);
  }
  const result = await fileTypeFromBuffer(file.buffer);
  if (!result || !validation.includes(result.mime)) {
    if (file.path) {
      await unlink(file.path);
    }
    throw new BadRequestException("Invalid file format");
  }

  // await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
  // const uniqueFileName = `assets/${customPath}/${randomUUID()}.${result.ext}`;
  // await writeFile(resolve(`./${uniqueFileName}`), file.buffer);
  if (file.path) {
    await unlink(file.path);
  }
  // file.path = uniqueFileName;
  return file;
};

export const processFiles = async ({
  customPath = "general",
  files,
  validation,
}: {
  customPath?: string;
  files: Express.Multer.File[];
  validation: string[];
}) => {
  const assets = [];
  for (const file of files) {
    const asset = await processFile({ customPath, file, validation });
    assets.push(asset);
  }
  return assets;
};

export const processFields = async ({
  customPath = "general",
  fields,
  validation,
}: {
  customPath?: string;
  fields: Record<string, Express.Multer.File[]>;
  validation: string[];
}) => {
  const assets = [];
  for (const field of Object.keys(fields)) {
    const files = await processFiles({ customPath, files: fields[field] as Express.Multer.File[], validation });
    assets.push({ field, files });
  }
  return assets;
};

export const processMulterUpload = async ({
  req,
  customPath = "general",
  isRequired = true,
  validation,
}: {
  req: Request;
  customPath?: string;
  isRequired?: boolean;
  validation: string[];
}) => {
  if (isRequired && !req.file && !(Array.isArray(req.files) && req.files?.length) && !(typeof req.files == "object" && Object.keys(req.files).length)) {
    throw new BadRequestException("file is required");
  }

  if (req.file) {
    await processFile({ customPath, file: req.file, validation });
  } else if (Array.isArray(req.files) && req.files?.length) {
    await processFiles({ customPath, files: req.files, validation });
  } else if (typeof req.files == "object" && Object.keys(req.files ?? {}).length) {
    await processFields({ customPath, fields: req.files as Record<string, Express.Multer.File[]>, validation });
  }
};