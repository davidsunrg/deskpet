import { getDb } from '@/db';
import { petFile, petMedia } from '@/db/schema';
import { getPresignedDownloadUrl } from '@/lib/storage/r2-s3';
import { galleryKindFromFileKind } from '@/utils/pets/pet-file-storage';
import { and, desc, eq } from 'drizzle-orm';
import { assertUserManagesPet } from './assert-user-manages-pet';

const DOWNLOAD_URL_TTL_SECONDS = 60 * 60;

export type ListedPetMedia = {
  id: string;
  petId: string;
  fileId: string;
  kind: 'photo' | 'video';
  source: 'upload' | 'ai';
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  filename: string | null;
  caption: string | null;
  capturedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  originalUrl: string;
  thumbnailUrl: string;
};

export type ListPetMediaInput = {
  userId: string;
  petId: string;
  kind?: 'photo' | 'video';
};

/** List gallery media sorted newest-first. */
export async function listPetMedia({
  userId,
  petId,
  kind,
}: ListPetMediaInput): Promise<ListedPetMedia[]> {
  await assertUserManagesPet(userId, petId);

  const fileKind =
    kind === 'photo' ? 'image' : kind === 'video' ? 'video' : null;

  const db = getDb();
  const rows = await db
    .select({
      id: petMedia.id,
      petId: petMedia.petId,
      fileId: petMedia.fileId,
      source: petMedia.source,
      caption: petMedia.caption,
      capturedAt: petMedia.capturedAt,
      createdAt: petMedia.createdAt,
      updatedAt: petMedia.updatedAt,
      fileKind: petFile.kind,
      file: petFile.file,
      thumbnailFile: petFile.thumbnailFile,
      filename: petFile.filename,
      width: petFile.width,
      height: petFile.height,
    })
    .from(petMedia)
    .innerJoin(petFile, eq(petMedia.fileId, petFile.id))
    .where(
      fileKind
        ? and(
            eq(petMedia.petId, petId),
            eq(petFile.purpose, 'gallery'),
            eq(petFile.kind, fileKind)
          )
        : and(eq(petMedia.petId, petId), eq(petFile.purpose, 'gallery'))
    )
    .orderBy(desc(petMedia.createdAt), desc(petMedia.id));

  return Promise.all(
    rows.map(async (row) => {
      const galleryKind = galleryKindFromFileKind(row.fileKind);
      if (!galleryKind) {
        throw new Error(`Unexpected gallery file kind: ${row.fileKind}`);
      }
      if (!row.thumbnailFile) {
        throw new Error(`Gallery file ${row.fileId} is missing a thumbnail.`);
      }

      const [originalUrl, thumbnailUrl] = await Promise.all([
        getPresignedDownloadUrl({
          key: row.file.key,
          expiresIn: DOWNLOAD_URL_TTL_SECONDS,
        }),
        getPresignedDownloadUrl({
          key: row.thumbnailFile.key,
          expiresIn: DOWNLOAD_URL_TTL_SECONDS,
        }),
      ]);

      return {
        id: row.id,
        petId: row.petId,
        fileId: row.fileId,
        kind: galleryKind,
        source: row.source as 'upload' | 'ai',
        mimeType: row.file.mimeType,
        byteSize: row.file.size,
        width: row.width ?? null,
        height: row.height ?? null,
        filename: row.filename ?? null,
        caption: row.caption ?? null,
        capturedAt: row.capturedAt ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        originalUrl,
        thumbnailUrl,
      };
    })
  );
}
