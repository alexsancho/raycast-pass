import { toDataURL } from "qrcode";

export const isDirectory = (string: string) => string.endsWith("/");

export const sortDirectoriesFirst = (array: string[]) =>
  array.sort((a, b) => (isDirectory(a) && !isDirectory(b) ? -1 : 0));

export async function generateQRCode(content: string): Promise<string | undefined> {
  if (! content) {
    return;
  }

  return await toDataURL(content, { width: 180 });
}
