export type PreparedCertificate = {
  filename: string;
  contentType: 'application/pdf' | 'image/jpeg' | 'image/png';
  size: number;
  data: Buffer;
};

const MAX_CERTIFICATE_COUNT = 5;
const MAX_CERTIFICATE_UPLOAD_BYTES = 4 * 1024 * 1024;
const CERTIFICATE_TYPES = new Map<string, PreparedCertificate['contentType']>([
  ['.pdf', 'application/pdf'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
]);

export async function prepareCertificates(
  files: File[],
): Promise<{ success: true; certificates: PreparedCertificate[] } | { success: false; error: string }> {
  if (files.length > MAX_CERTIFICATE_COUNT) {
    return { success: false, error: `Upload no more than ${MAX_CERTIFICATE_COUNT} certificates` };
  }

  const totalSize = files.reduce((total, file) => total + file.size, 0);
  if (totalSize > MAX_CERTIFICATE_UPLOAD_BYTES) {
    return { success: false, error: 'Combined certificate files must be 4 MB or smaller' };
  }

  const certificates: PreparedCertificate[] = [];
  for (const file of files) {
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const expectedType = CERTIFICATE_TYPES.get(extension);
    if (!expectedType || (file.type && file.type !== expectedType)) {
      return { success: false, error: 'Certificates must be PDF, JPG, JPEG, or PNG files' };
    }

    const data = Buffer.from(await file.arrayBuffer());
    const isValidFileSignature = expectedType === 'application/pdf'
      ? data.subarray(0, 5).toString() === '%PDF-'
      : expectedType === 'image/png'
        ? data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
    if (!isValidFileSignature) {
      return {
        success: false,
        error: `The file "${file.name}" is not a valid ${expectedType === 'application/pdf' ? 'PDF' : expectedType === 'image/png' ? 'PNG' : 'JPEG'} file`,
      };
    }

    certificates.push({
      filename: file.name.replace(/[/\\\r\n"]/g, '_'),
      contentType: expectedType,
      size: file.size,
      data,
    });
  }

  return { success: true, certificates };
}
