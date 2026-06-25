import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

let client: S3Client | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT?.trim() &&
      process.env.S3_ACCESS_KEY?.trim() &&
      process.env.S3_SECRET_KEY?.trim() &&
      process.env.S3_BUCKET?.trim(),
  );
}

function getS3Client(): S3Client {
  if (!isStorageConfigured()) {
    throw new Error('Object storage is not configured');
  }

  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION ?? 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    });
  }

  return client;
}

export function getAssetPublicUrl(key: string): string {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, '');
  if (base) return `${base}/${key}`;
  const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '');
  const bucket = process.env.S3_BUCKET;
  return `${endpoint}/${bucket}/${key}`;
}

export async function uploadAsset(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const bucket = process.env.S3_BUCKET!;
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return getAssetPublicUrl(key);
}
