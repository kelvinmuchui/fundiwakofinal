import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_KEY;

if (!SECRET_KEY) {
  console.warn('⚠️ ENCRYPTION_KEY not set in environment variables. Encryption will not work.');
}

/**
 * Encrypt sensitive data (bank details, ID numbers, etc.)
 * @param data - String data to encrypt
 * @returns Encrypted string
 */
export function encryptData(data: string): string {
  if (!SECRET_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  try {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted string
 * @returns Decrypted original string
 */
export function decryptData(encryptedData: string): string {
  if (!SECRET_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error('Decryption resulted in empty string');
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Safely decrypt data, returning null if decryption fails
 * Useful for optional encrypted fields
 */
export function decryptDataSafe(encryptedData: string | null | undefined): string | null {
  if (!encryptedData) {
    return null;
  }
  try {
    return decryptData(encryptedData);
  } catch {
    return null;
  }
}
