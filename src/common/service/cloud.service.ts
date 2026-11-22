import { CompleteMultipartUploadCommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { APP_NAME, AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_KEY, BUCKET, REGION } from "../../config";
import { IFile } from "../types/express.types";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../exception";
import { Progress, Upload } from "@aws-sdk/lib-storage";

export class CloudService {
  private readonly client: S3Client;
  constructor() {
    this.client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: AWS_S3_SECRET_KEY,
      },
    });
  }

  private generateKey({ path = "public", file }: { path?: string; file: IFile }) {
    return `${APP_NAME}/${path}/${randomUUID()}/${file.originalname}`;
  }

  async uploadAsset({
    Bucket = BUCKET,
    ACL = ObjectCannedACL.private,
    path = "public",
    file,
  }: {
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    file: IFile;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket,
      Key: this.generateKey({ path, file }),
      ACL,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    if (!command.input.Key) {
      throw new BadRequestException("Fail to upload this asset");
    }
    await this.client.send(command);
    return command.input.Key;
  }

  async uploadLargeAsset({
    Bucket = BUCKET,
    ACL = ObjectCannedACL.private,
    path = "public",
    file,
    partSize = 5,
  }: {
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    partSize?: number;
    file: IFile;
  }): Promise<CompleteMultipartUploadCommandOutput> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket,
        Key: this.generateKey({ path, file }),
        ACL,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
      partSize: partSize * 1024 * 1024,
    });
    upload.on("httpUploadProgress", (process: Progress) => {
      console.log(`Fail upload is ${((process.loaded as number) / (process.total as number)) * 100}%`);
    });
    return await upload.done();
  }
}

export const cloudService = new CloudService();