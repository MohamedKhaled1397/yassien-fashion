import { get, put } from "@vercel/blob";

/** Folder prefix inside the Blob store for site JSON files. */
const PREFIX = "me5a-site-data";

export function isBlobJsonPersistence(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function blobPathname(filename: string): string {
  return `${PREFIX}/${filename}`;
}

export async function readBlobJsonText(filename: string): Promise<string | null> {
  const result = await get(blobPathname(filename), {
    access: "private",
    useCache: false,
  });
  if (!result || result.statusCode !== 200) return null;
  return new Response(result.stream).text();
}

export async function writeBlobJsonText(
  filename: string,
  body: string,
): Promise<void> {
  await put(blobPathname(filename), body, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  });
}
