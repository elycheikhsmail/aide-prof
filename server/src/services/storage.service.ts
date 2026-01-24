import { Client } from 'minio';
import { env } from '../config/env.js';

class StorageService {
  private client: Client;
  private bucket: string;

  constructor() {
    this.client = new Client({
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
    });
    this.bucket = env.MINIO_BUCKET_NAME;
  }

  async init(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
    }
  }

  async uploadPdf(fileName: string, buffer: Buffer): Promise<string> {
    await this.client.putObject(this.bucket, fileName, buffer, buffer.length, {
      'Content-Type': 'application/pdf',
    });
    return this.getFileUrl(fileName);
  }

  async getFileUrl(fileName: string): Promise<string> {
    return this.client.presignedGetObject(this.bucket, fileName, 7 * 24 * 60 * 60);
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.client.removeObject(this.bucket, fileName);
  }
}

export const storageService = new StorageService();
